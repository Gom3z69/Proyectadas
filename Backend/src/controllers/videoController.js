import config from '../../Config.js';
import { LIMITES_MB } from '../Configs/archivos.js';
import { NIVELES_INSIGNIA } from '../Configs/insignias.js';
import Guardado from '../models/Guardado.js';
import Like from '../models/Like.js';
import Seguimiento from '../models/Seguimiento.js';
import Usuario from '../models/Usuario.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { esAdmin } from '../utils/admins.js';
import { borrarArchivo, guardarArchivo, guardarArchivos } from '../utils/almacenamiento.js';
import { eliminarVideoCompleto } from '../utils/eliminaciones.js';
import { extraerHashtags, paginacion, texto } from '../utils/entrada.js';
import {
  actualizarInsignia,
  nivelPorProgreso,
  registrarEliminacion,
  registrarPublicacion,
  resumenInsignia,
} from '../utils/insignias.js';
import { notificar, retirarNotificaciones } from '../utils/notificaciones.js';
import { CAMPOS_AUTOR, serializarVideos } from '../utils/serializar.js';
import { autorOculto, contenidoOculto } from '../utils/visibilidad.js';

const TIPOS_FEED = ['para-ti', 'siguiendo', 'elite'];
const NO_EXISTE = 'Esta proyectada no existe o fue eliminada';
const YA_PUBLICADA = 'Esta proyectada ya está publicada';

function fechaValida(valor) {
  const fecha = new Date(typeof valor === 'string' ? valor : NaN);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Autores con insignia Gran Maestro vigente (se actualiza su racha antes de filtrar). Las cuentas
 * administradoras siempre están: su insignia es permanente.
 */
async function autoresElite() {
  const minimo = NIVELES_INSIGNIA.at(-1).minimo;
  const candidatos = await Usuario.find({
    $or: [{ 'insignia.progreso': { $gte: minimo } }, { username: { $in: config.admins } }],
  });
  const ahora = new Date();
  const elite = [];
  for (const usuario of candidatos) {
    if (esAdmin(usuario)) {
      elite.push(usuario._id);
      continue;
    }
    if (actualizarInsignia(usuario.insignia, ahora)) await usuario.save();
    if (usuario.insignia.progreso >= minimo) elite.push(usuario._id);
  }
  return elite;
}

/**
 * Ranking de "Para ti": interacción ponderada que decae con la antigüedad,
 * así los videos nuevos tienen oportunidad y los populares se mantienen arriba.
 */
async function idsPorTendencia(filtro, desde, salto, limite) {
  const filas = await Video.aggregate([
    { $match: filtro },
    { $addFields: { _horas: { $divide: [{ $subtract: [desde, '$publicadoEn'] }, 3_600_000] } } },
    {
      $addFields: {
        _puntaje: {
          $divide: [
            {
              $add: [
                1,
                { $multiply: ['$likesCount', 3] },
                { $multiply: ['$comentariosCount', 4] },
                { $multiply: ['$vistas', 0.2] },
              ],
            },
            { $pow: [{ $add: ['$_horas', 2] }, 1.2] },
          ],
        },
      },
    },
    { $sort: { _puntaje: -1, _id: -1 } },
    { $skip: salto },
    { $limit: limite },
    { $project: { _id: 1 } },
  ]);
  return filas.map((fila) => fila._id);
}

export async function obtenerFeed(req, res) {
  const tipo = TIPOS_FEED.includes(req.query.tipo) ? req.query.tipo : 'para-ti';
  const { limite, salto } = paginacion(req.query, { porDefecto: 6, maximo: 20 });
  // `desde` congela el feed al momento de la primera página para que la paginación no se desplace.
  const desde = fechaValida(req.query.desde) ?? new Date();

  // Nunca aparecen cuentas bloqueadas o suspendidas ni lo que la persona reportó.
  const oculto = await contenidoOculto(req.usuario._id);
  const filtro = {
    estado: 'publicada',
    publicadoEn: { $lte: desde },
    _id: { $nin: oculto.videos },
    autor: { $nin: oculto.autores },
  };
  if (tipo === 'siguiendo') {
    filtro.autor.$in = await Seguimiento.distinct('seguido', { seguidor: req.usuario._id });
  } else if (tipo === 'elite') {
    filtro.autor.$in = await autoresElite();
  }

  let videos;
  if (tipo === 'siguiendo') {
    videos = await Video.find(filtro)
      .sort({ publicadoEn: -1, _id: -1 })
      .skip(salto)
      .limit(limite + 1)
      .populate('autor', CAMPOS_AUTOR)
      .lean();
  } else {
    const orden = await idsPorTendencia(filtro, desde, salto, limite + 1);
    const encontrados = await Video.find({ _id: { $in: orden } })
      .populate('autor', CAMPOS_AUTOR)
      .lean();
    const porId = new Map(encontrados.map((video) => [String(video._id), video]));
    videos = orden.map((id) => porId.get(String(id))).filter(Boolean);
  }

  res.json({
    videos: await serializarVideos(videos.slice(0, limite), req.usuario),
    hayMas: videos.length > limite,
    desde,
  });
}

/** Serializa un video recién creado o editado por el usuario actual. */
async function serializarPropio(video, usuario) {
  const datos = typeof video.toObject === 'function' ? video.toObject() : video;
  const [serializado] = await serializarVideos([{ ...datos, autor: usuario.toObject() }], usuario);
  return serializado;
}

/**
 * Suma la publicación a la racha y devuelve qué avisar (nuevo nivel o insignia revivida).
 * Una cuenta administradora ya tiene la insignia permanente: no hay nada que avisar.
 */
function sumarARacha(usuario, ahora) {
  const evento = registrarPublicacion(usuario.insignia, ahora);
  return esAdmin(usuario) ? { revivida: false, nuevoNivel: null } : evento;
}

/** Campos que se fijan al publicar: fecha e insignia alcanzada (la racha ya se actualizó). */
function datosPublicacion(usuario, ahora) {
  return {
    estado: 'publicada',
    publicadoEn: ahora,
    nivelInsignia: nivelPorProgreso(usuario.insignia.progreso)?.clave ?? null,
  };
}

/** Sube una proyectada. Con `borrador=true` se guarda sin publicar: no toca la racha ni la insignia. */
export async function publicarVideo(req, res) {
  const archivo = req.files?.video?.[0];
  if (!archivo) throw ApiError.solicitudInvalida('Selecciona un video para publicar');

  const miniatura = req.files?.miniatura?.[0];
  if (miniatura && miniatura.size > LIMITES_MB.imagen * 1024 * 1024) {
    throw new ApiError(413, `La miniatura supera ${LIMITES_MB.imagen} MB`);
  }

  const descripcion = texto(req.body?.descripcion);
  const duracion = Number(req.body?.duracion);
  const [url, miniaturaUrl] = await guardarArchivos([
    { archivo, carpeta: 'videos' },
    { archivo: miniatura, carpeta: 'miniaturas' },
  ]);
  const datos = {
    autor: req.usuario._id,
    descripcion,
    hashtags: extraerHashtags(descripcion),
    url,
    miniatura: miniaturaUrl,
    duracion: Number.isFinite(duracion) && duracion > 0 ? Math.round(duracion * 10) / 10 : 0,
    tipo: archivo.mimetype,
    tamano: archivo.size,
  };

  const esBorrador = texto(req.body?.borrador) === 'true';
  let video;
  let evento = null;
  try {
    if (esBorrador) {
      video = await Video.create({ ...datos, estado: 'borrador' });
    } else {
      // La racha se calcula primero en memoria: si guardar el video falla, el usuario no se modifica.
      const ahora = new Date();
      evento = sumarARacha(req.usuario, ahora);
      video = await Video.create({ ...datos, ...datosPublicacion(req.usuario, ahora) });
    }
  } catch (error) {
    // Si el video no se pudo crear, sus archivos no deben quedar huérfanos.
    await Promise.all([borrarArchivo(url), borrarArchivo(miniaturaUrl)]);
    throw error;
  }
  if (esBorrador) return res.status(201).json({ video: await serializarPropio(video, req.usuario) });
  await req.usuario.save();

  res.status(201).json({
    video: await serializarPropio(video, req.usuario),
    insignia: resumenInsignia(req.usuario),
    evento,
  });
}

/** Borrador del usuario actual (los borradores ajenos no existen para él). */
async function borradorPropio(req) {
  const video = await Video.findById(req.params.id).select('autor estado miniatura').lean();
  const esMio = Boolean(video?.autor.equals(req.usuario._id));
  if (!video || (!esMio && video.estado === 'borrador')) throw ApiError.noEncontrado(NO_EXISTE);
  if (!esMio) throw ApiError.prohibido('Solo puedes editar tus propias proyectadas');
  if (video.estado !== 'borrador') throw ApiError.conflicto(YA_PUBLICADA);
  return video;
}

/** Descripción y portada nuevas que se enviaron al editar o publicar un borrador. */
async function leerCambios(req) {
  const cambios = {};
  if (req.body?.descripcion !== undefined) {
    cambios.descripcion = texto(req.body.descripcion);
    cambios.hashtags = extraerHashtags(cambios.descripcion);
  }
  if (req.file) cambios.miniatura = await guardarArchivo(req.file, 'miniaturas');
  return cambios;
}

/**
 * Aplica los cambios solo si el video sigue siendo borrador: así un doble envío
 * no lo publica (ni suma a la racha) dos veces.
 */
async function actualizarBorrador(anterior, cambios) {
  let video;
  try {
    video = await Video.findOneAndUpdate({ _id: anterior._id, estado: 'borrador' }, cambios, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
  } catch (error) {
    await borrarArchivo(cambios.miniatura);
    throw error;
  }
  if (!video) {
    await borrarArchivo(cambios.miniatura);
    throw ApiError.conflicto(YA_PUBLICADA);
  }
  if (cambios.miniatura && anterior.miniatura) await borrarArchivo(anterior.miniatura);
  return video;
}

export async function editarBorrador(req, res) {
  const borrador = await borradorPropio(req);
  const video = await actualizarBorrador(borrador, await leerCambios(req));
  res.json({ video: await serializarPropio(video, req.usuario) });
}

/** Publica un borrador (con los últimos cambios enviados): suma 1 a la racha como cualquier publicación. */
export async function publicarBorrador(req, res) {
  const borrador = await borradorPropio(req);
  const cambios = await leerCambios(req);

  const ahora = new Date();
  const evento = sumarARacha(req.usuario, ahora);
  const video = await actualizarBorrador(borrador, { ...cambios, ...datosPublicacion(req.usuario, ahora) });
  await req.usuario.save();

  res.json({
    video: await serializarPropio(video, req.usuario),
    insignia: resumenInsignia(req.usuario),
    evento,
  });
}

export async function obtenerVideo(req, res) {
  const video = await Video.findById(req.params.id).populate('autor', CAMPOS_AUTOR).lean();
  const esMio = Boolean(video?.autor?._id.equals(req.usuario._id));
  // Un borrador solo lo ve su autor; tampoco se ve lo de cuentas bloqueadas o suspendidas, ni lo reportado.
  let visible = Boolean(video?.autor) && (esMio || video.estado === 'publicada');
  if (visible && !esMio) {
    const oculto = await contenidoOculto(req.usuario._id);
    visible = ![...oculto.autores, ...oculto.videos].some((id) => id.equals(video.autor._id) || id.equals(video._id));
  }
  const [serializado] = visible ? await serializarVideos([video], req.usuario) : [];
  if (!serializado) throw ApiError.noEncontrado(NO_EXISTE);
  res.json({ video: serializado });
}

export async function eliminarVideo(req, res) {
  const video = await Video.findById(req.params.id);
  const esMio = Boolean(video?.autor.equals(req.usuario._id));
  if (!video || (!esMio && video.estado === 'borrador')) throw ApiError.noEncontrado(NO_EXISTE);
  if (!esMio) throw ApiError.prohibido('Solo puedes eliminar tus propias proyectadas');

  await eliminarVideoCompleto(video);

  // Un borrador nunca sumó a la racha, así que borrarlo no la toca.
  if (video.estado === 'publicada') {
    registrarEliminacion(req.usuario.insignia, video.publicadoEn);
    await req.usuario.save();
  }

  res.json({ eliminado: true, estado: video.estado, insignia: resumenInsignia(req.usuario) });
}

async function leerContador(videoId, campo) {
  const video = await Video.findById(videoId).select(campo).lean();
  if (!video) throw ApiError.noEncontrado(NO_EXISTE);
  return video[campo];
}

/**
 * Crea la marca (like o guardado) del usuario y suma al contador. Es idempotente.
 * `alMarcar(video)` se ejecuta solo cuando la marca es nueva.
 */
async function marcar(Modelo, campo, req, alMarcar) {
  const video = await Video.findOne({ _id: req.params.id, estado: 'publicada' }).select('autor').lean();
  if (!video || (await autorOculto(req.usuario._id, video.autor))) throw ApiError.noEncontrado(NO_EXISTE);

  try {
    await Modelo.create({ usuario: req.usuario._id, video: video._id });
    await Video.updateOne({ _id: video._id }, { $inc: { [campo]: 1 } });
    await alMarcar?.(video);
  } catch (error) {
    if (error.code !== 11000) throw error; // Ya estaba marcado: no se cuenta dos veces.
  }
  return leerContador(video._id, campo);
}

/** Quita la marca del usuario. `alDesmarcar()` se ejecuta solo si existía. */
async function desmarcar(Modelo, campo, req, alDesmarcar) {
  const { deletedCount } = await Modelo.deleteOne({ usuario: req.usuario._id, video: req.params.id });
  if (deletedCount) {
    await Video.updateOne({ _id: req.params.id, [campo]: { $gt: 0 } }, { $inc: { [campo]: -1 } });
    await alDesmarcar?.();
  }
  return leerContador(req.params.id, campo);
}

export async function darLike(req, res) {
  const likesCount = await marcar(Like, 'likesCount', req, (video) =>
    notificar({ destinatario: video.autor, actor: req.usuario._id, tipo: 'like', video: video._id }),
  );
  res.json({ meGusta: true, likesCount });
}

export async function quitarLike(req, res) {
  const likesCount = await desmarcar(Like, 'likesCount', req, () =>
    retirarNotificaciones({ actor: req.usuario._id, tipo: 'like', video: req.params.id }),
  );
  res.json({ meGusta: false, likesCount });
}

export async function guardarVideo(req, res) {
  res.json({ guardado: true, guardadosCount: await marcar(Guardado, 'guardadosCount', req) });
}

export async function quitarGuardado(req, res) {
  res.json({ guardado: false, guardadosCount: await desmarcar(Guardado, 'guardadosCount', req) });
}

export async function registrarVista(req, res) {
  const { matchedCount } = await Video.updateOne(
    { _id: req.params.id, estado: 'publicada' },
    { $inc: { vistas: 1 } },
  );
  if (!matchedCount) throw ApiError.noEncontrado(NO_EXISTE);
  res.status(204).end();
}
