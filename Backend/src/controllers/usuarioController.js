import Bloqueo from '../models/Bloqueo.js';
import Guardado from '../models/Guardado.js';
import Like from '../models/Like.js';
import Seguimiento from '../models/Seguimiento.js';
import Usuario from '../models/Usuario.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { borrarArchivo, guardarArchivo } from '../utils/almacenamiento.js';
import { escaparRegex, paginacion, texto } from '../utils/entrada.js';
import { actualizarInsignia, resumenInsignia } from '../utils/insignias.js';
import { notificar, retirarNotificaciones } from '../utils/notificaciones.js';
import {
  CAMPOS_AUTOR,
  serializarVideos,
  usuarioPrivado,
  usuarioPublico,
} from '../utils/serializar.js';
import { contenidoOculto, estadoBloqueo } from '../utils/visibilidad.js';

const ORDENES_VIDEOS = {
  recientes: { publicadoEn: -1, _id: -1 },
  populares: { likesCount: -1, vistas: -1, publicadoEn: -1, _id: -1 },
};

// Filtros de "Mis Proyectadas" (solo el autor ve sus borradores).
const FILTROS_ESTUDIO = {
  todas: {},
  publicadas: { estado: 'publicada' },
  borradores: { estado: 'borrador' },
};

async function buscarPorUsername(username, campos) {
  const usuario = await Usuario.findOne({ username: texto(username).toLowerCase() }).select(campos);
  if (!usuario) throw ApiError.noEncontrado('Este usuario no existe');
  return usuario;
}

/**
 * Cuenta del parámetro :username que la persona puede ver: si la bloqueó o está suspendida,
 * responde como si no existiera. `yoBloquee` indica que la persona la bloqueó.
 */
async function buscarVisible(req, campos) {
  const usuario = await buscarPorUsername(req.params.username, campos && `${campos} suspendida`);
  if (usuario._id.equals(req.usuario._id)) return { usuario, yoBloquee: false };
  const { yoBloquee, meBloqueo } = await estadoBloqueo(req.usuario._id, usuario._id);
  if (meBloqueo || usuario.suspendida) throw ApiError.noEncontrado('Este usuario no existe');
  return { usuario, yoBloquee };
}

export async function buscarUsuarios(req, res) {
  const consulta = texto(req.query.q).replace(/^@/, '').slice(0, 40);
  if (!consulta) return res.json({ usuarios: [] });

  const patron = new RegExp(escaparRegex(consulta), 'i');
  const { autores } = await contenidoOculto(req.usuario._id);
  const usuarios = await Usuario.find({ $or: [{ username: patron }, { nombre: patron }], _id: { $nin: autores } })
    .select(CAMPOS_AUTOR)
    .sort({ 'insignia.progreso': -1 })
    .limit(8)
    .lean();

  const ahora = new Date();
  res.json({ usuarios: usuarios.map((usuario) => usuarioPublico(usuario, ahora)) });
}

export async function obtenerPerfil(req, res) {
  const { usuario, yoBloquee } = await buscarVisible(req);
  if (actualizarInsignia(usuario.insignia)) await usuario.save();

  const esPropio = usuario._id.equals(req.usuario._id);
  const publicadas = { autor: usuario._id, estado: 'publicada' };
  const [seguidores, seguidos, videos, likes, siguiendo, destacado, borradores] = await Promise.all([
    Seguimiento.countDocuments({ seguido: usuario._id }),
    Seguimiento.countDocuments({ seguidor: usuario._id }),
    Video.countDocuments(publicadas),
    Video.aggregate([
      { $match: publicadas },
      { $group: { _id: null, total: { $sum: '$likesCount' } } },
    ]),
    esPropio ? null : Seguimiento.exists({ seguidor: req.usuario._id, seguido: usuario._id }),
    // Su proyectada más popular sirve de portada del perfil.
    Video.findOne(publicadas).sort(ORDENES_VIDEOS.populares).select('url miniatura').lean(),
    esPropio ? Video.countDocuments({ autor: usuario._id, estado: 'borrador' }) : null,
  ]);

  res.json({
    usuario: {
      id: String(usuario._id),
      nombre: usuario.nombre,
      username: usuario.username,
      bio: usuario.bio,
      avatar: usuario.avatar,
      creadoEn: usuario.createdAt,
      insignia: resumenInsignia(usuario),
      estadisticas: {
        seguidores,
        seguidos,
        videos,
        likes: likes[0]?.total ?? 0,
        ...(esPropio && { borradores }),
      },
      portada: destacado ? { url: destacado.url, miniatura: destacado.miniatura } : null,
      siguiendo: Boolean(siguiendo),
      esPropio,
      // La persona la bloqueó: el frontend muestra solo la opción de desbloquear.
      bloqueadoPorMi: yoBloquee,
    },
  });
}

export async function videosDeUsuario(req, res) {
  const { usuario, yoBloquee } = await buscarVisible(req, '_id');
  if (yoBloquee) return res.json({ videos: [], hayMas: false, total: 0 });
  const { limite, salto } = paginacion(req.query, { porDefecto: 12, maximo: 30 });
  const orden = Object.hasOwn(ORDENES_VIDEOS, req.query.orden)
    ? ORDENES_VIDEOS[req.query.orden]
    : ORDENES_VIDEOS.recientes;

  // Sin las proyectadas que la persona reportó.
  const reportadas = usuario._id.equals(req.usuario._id) ? [] : (await contenidoOculto(req.usuario._id)).videos;
  const publicadas = { autor: usuario._id, estado: 'publicada', _id: { $nin: reportadas } };
  const [videos, total] = await Promise.all([
    Video.find(publicadas)
      .sort(orden)
      .skip(salto)
      .limit(limite + 1)
      .populate('autor', CAMPOS_AUTOR)
      .lean(),
    Video.countDocuments(publicadas),
  ]);

  res.json({
    videos: await serializarVideos(videos.slice(0, limite), req.usuario),
    hayMas: videos.length > limite,
    total,
  });
}

/**
 * Mis Proyectadas con sus borradores. Primero los borradores (del último guardado al primero)
 * y luego las publicadas (de la más reciente a la más antigua), con el conteo de cada estado.
 */
export async function misVideos(req, res) {
  const { limite, salto } = paginacion(req.query, { porDefecto: 12, maximo: 30 });
  const filtro = Object.hasOwn(FILTROS_ESTUDIO, req.query.estado)
    ? FILTROS_ESTUDIO[req.query.estado]
    : FILTROS_ESTUDIO.todas;
  const autor = req.usuario._id;

  const [videos, conteo] = await Promise.all([
    Video.find({ ...filtro, autor })
      .sort({ estado: 1, publicadoEn: -1, updatedAt: -1, _id: -1 })
      .skip(salto)
      .limit(limite + 1)
      .populate('autor', CAMPOS_AUTOR)
      .lean(),
    Video.aggregate([{ $match: { autor } }, { $group: { _id: '$estado', total: { $sum: 1 } } }]),
  ]);
  const totales = Object.fromEntries(conteo.map((fila) => [fila._id, fila.total]));

  res.json({
    videos: await serializarVideos(videos.slice(0, limite), req.usuario),
    hayMas: videos.length > limite,
    conteo: { publicadas: totales.publicada ?? 0, borradores: totales.borrador ?? 0 },
  });
}

/** Videos que el usuario actual marcó (Like → "Con Me Gusta", Guardado → "Favoritos"), del más reciente al más antiguo. */
async function videosMarcados(Modelo, req, res) {
  const { limite, salto } = paginacion(req.query, { porDefecto: 12, maximo: 30 });
  const filas = await Modelo.find({ usuario: req.usuario._id })
    .sort({ createdAt: -1, _id: -1 })
    .skip(salto)
    .limit(limite + 1)
    .populate({ path: 'video', populate: { path: 'autor', select: CAMPOS_AUTOR } })
    .lean();

  const oculto = await contenidoOculto(req.usuario._id);
  const ocultos = new Set([...oculto.autores, ...oculto.videos].map(String));
  const videos = filas
    .slice(0, limite)
    .map((fila) => fila.video)
    .filter((video) => video && !ocultos.has(String(video._id)) && !ocultos.has(String(video.autor?._id)));
  res.json({ videos: await serializarVideos(videos, req.usuario), hayMas: filas.length > limite });
}

export const misGuardados = (req, res) => videosMarcados(Guardado, req, res);
export const misMeGusta = (req, res) => videosMarcados(Like, req, res);

export async function actualizarPerfil(req, res) {
  const usuario = req.usuario;
  const { nombre, bio, quitarAvatar } = req.body ?? {};

  if (nombre !== undefined) usuario.nombre = texto(nombre);
  if (bio !== undefined) usuario.bio = texto(bio);

  const avatarAnterior = usuario.avatar;
  if (req.file) usuario.avatar = await guardarArchivo(req.file, 'avatares');
  else if (quitarAvatar === true || quitarAvatar === 'true') usuario.avatar = '';

  try {
    await usuario.save();
  } catch (error) {
    if (req.file) await borrarArchivo(usuario.avatar);
    throw error;
  }
  if (avatarAnterior && avatarAnterior !== usuario.avatar) {
    await borrarArchivo(avatarAnterior);
  }

  res.json({ usuario: usuarioPrivado(usuario) });
}

export async function seguir(req, res) {
  const { usuario, yoBloquee } = await buscarVisible(req, '_id');
  if (usuario._id.equals(req.usuario._id)) {
    throw ApiError.solicitudInvalida('No puedes seguirte a ti mismo');
  }
  if (yoBloquee) throw ApiError.prohibido('Desbloquea a esta cuenta para seguirla');

  try {
    await Seguimiento.create({ seguidor: req.usuario._id, seguido: usuario._id });
    await notificar({ destinatario: usuario._id, actor: req.usuario._id, tipo: 'seguidor' });
  } catch (error) {
    if (error.code !== 11000) throw error; // Ya lo seguía: la operación es idempotente.
  }

  const seguidores = await Seguimiento.countDocuments({ seguido: usuario._id });
  res.json({ siguiendo: true, seguidores });
}

export async function dejarDeSeguir(req, res) {
  const usuario = await buscarPorUsername(req.params.username, '_id');
  const { deletedCount } = await Seguimiento.deleteOne({ seguidor: req.usuario._id, seguido: usuario._id });
  if (deletedCount) {
    await retirarNotificaciones({ destinatario: usuario._id, actor: req.usuario._id, tipo: 'seguidor' });
  }

  const seguidores = await Seguimiento.countDocuments({ seguido: usuario._id });
  res.json({ siguiendo: false, seguidores });
}

async function listarRelacion(req, res, tipo) {
  const { usuario, yoBloquee } = await buscarVisible(req, '_id');
  if (yoBloquee) return res.json({ usuarios: [], hayMas: false });
  const { limite, salto } = paginacion(req.query, { porDefecto: 20, maximo: 50 });
  const [campoFiltro, campoUsuario] =
    tipo === 'seguidores' ? ['seguido', 'seguidor'] : ['seguidor', 'seguido'];

  const { autores } = await contenidoOculto(req.usuario._id);
  const filas = await Seguimiento.find({ [campoFiltro]: usuario._id, [campoUsuario]: { $nin: autores } })
    .sort({ createdAt: -1, _id: -1 })
    .skip(salto)
    .limit(limite + 1)
    .populate(campoUsuario, CAMPOS_AUTOR)
    .lean();

  const usuarios = filas
    .slice(0, limite)
    .map((fila) => fila[campoUsuario])
    .filter(Boolean);
  const sigo = new Set(
    (
      await Seguimiento.distinct('seguido', {
        seguidor: req.usuario._id,
        seguido: { $in: usuarios.map((u) => u._id) },
      })
    ).map(String),
  );

  const ahora = new Date();
  res.json({
    usuarios: usuarios.map((u) => ({
      ...usuarioPublico(u, ahora),
      siguiendo: sigo.has(String(u._id)),
      esPropio: u._id.equals(req.usuario._id),
    })),
    hayMas: filas.length > limite,
  });
}

export const listarSeguidores = (req, res) => listarRelacion(req, res, 'seguidores');
export const listarSeguidos = (req, res) => listarRelacion(req, res, 'seguidos');

/** Bloquea una cuenta: se ocultan entre sí, se deshacen los seguimientos y se borran sus avisos mutuos. */
export async function bloquear(req, res) {
  const usuario = await buscarPorUsername(req.params.username, '_id');
  const yo = req.usuario._id;
  if (usuario._id.equals(yo)) throw ApiError.solicitudInvalida('No puedes bloquearte a ti mismo');

  try {
    await Bloqueo.create({ bloqueador: yo, bloqueado: usuario._id });
  } catch (error) {
    if (error.code !== 11000) throw error; // Ya estaba bloqueada.
  }
  await Promise.all([
    Seguimiento.deleteMany({
      $or: [
        { seguidor: yo, seguido: usuario._id },
        { seguidor: usuario._id, seguido: yo },
      ],
    }),
    retirarNotificaciones({
      $or: [
        { destinatario: yo, actor: usuario._id },
        { destinatario: usuario._id, actor: yo },
      ],
    }),
  ]);
  res.json({ bloqueado: true });
}

export async function desbloquear(req, res) {
  const usuario = await buscarPorUsername(req.params.username, '_id');
  await Bloqueo.deleteOne({ bloqueador: req.usuario._id, bloqueado: usuario._id });
  res.json({ bloqueado: false });
}

/** Cuentas que bloqueé, de la más reciente a la más antigua (para Configuración). */
export async function listarBloqueados(req, res) {
  const { limite, salto } = paginacion(req.query, { porDefecto: 20, maximo: 50 });
  const filas = await Bloqueo.find({ bloqueador: req.usuario._id })
    .sort({ createdAt: -1, _id: -1 })
    .skip(salto)
    .limit(limite + 1)
    .populate('bloqueado', CAMPOS_AUTOR)
    .lean();

  const ahora = new Date();
  res.json({
    usuarios: filas
      .slice(0, limite)
      .filter((fila) => fila.bloqueado)
      .map((fila) => ({ ...usuarioPublico(fila.bloqueado, ahora), bloqueadoEn: fila.createdAt })),
    hayMas: filas.length > limite,
  });
}
