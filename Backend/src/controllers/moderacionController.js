import Comentario from '../models/Comentario.js';
import Reporte from '../models/Reporte.js';
import Usuario from '../models/Usuario.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { esAdmin } from '../utils/admins.js';
import { eliminarComentarioCompleto, eliminarVideoCompleto } from '../utils/eliminaciones.js';
import { paginacion } from '../utils/entrada.js';
import { registrarEliminacion } from '../utils/insignias.js';
import { CAMPOS_AUTOR, usuarioPublico } from '../utils/serializar.js';

const ESTADOS = ['pendiente', 'resuelto', 'descartado'];
const ACCIONES = ['eliminar', 'suspender', 'descartar'];

/** Mismo contenido reportado: agrupa los reportes de distintas personas. */
const claveObjetivo = (reporte) => ({
  tipo: reporte.tipo,
  video: reporte.video,
  comentario: reporte.comentario,
  usuario: reporte.usuario,
});

/**
 * Reportes agrupados por contenido. Los pendientes se ordenan por cantidad de reportes
 * (lo más reportado primero); los resueltos y descartados, del más reciente al más antiguo.
 */
export async function listarReportes(req, res) {
  const estado = ESTADOS.includes(req.query.estado) ? req.query.estado : 'pendiente';
  const { limite, salto } = paginacion(req.query, { porDefecto: 10, maximo: 30 });

  const [grupos, pendientes] = await Promise.all([
    Reporte.aggregate([
      { $match: { estado } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { tipo: '$tipo', video: '$video', comentario: '$comentario', usuario: '$usuario' },
          idReporte: { $first: '$_id' },
          total: { $sum: 1 },
          motivos: { $push: '$motivo' },
          detalles: { $push: '$detalle' },
          ultimo: { $first: '$createdAt' },
          resolucion: { $first: '$resolucion' },
        },
      },
      { $sort: estado === 'pendiente' ? { total: -1, ultimo: -1 } : { ultimo: -1 } },
      { $skip: salto },
      { $limit: limite + 1 },
    ]),
    Reporte.countDocuments({ estado: 'pendiente' }),
  ]);

  const ids = (campo) => grupos.map((grupo) => grupo._id[campo]).filter(Boolean);
  const [videos, comentarios, usuarios] = await Promise.all([
    Video.find({ _id: { $in: ids('video') } }).select('url miniatura descripcion').lean(),
    Comentario.find({ _id: { $in: ids('comentario') } }).select('texto').lean(),
    Usuario.find({ _id: { $in: ids('usuario') } }).select(`${CAMPOS_AUTOR} suspendida`).lean(),
  ]);
  const porId = (lista) => new Map(lista.map((item) => [String(item._id), item]));
  const [videoPorId, comentarioPorId, usuarioPorId] = [porId(videos), porId(comentarios), porId(usuarios)];
  const ahora = new Date();

  res.json({
    grupos: grupos.slice(0, limite).map((grupo) => {
      const video = videoPorId.get(String(grupo._id.video));
      const comentario = comentarioPorId.get(String(grupo._id.comentario));
      const usuario = usuarioPorId.get(String(grupo._id.usuario));
      const motivos = {};
      for (const motivo of grupo.motivos) motivos[motivo] = (motivos[motivo] ?? 0) + 1;
      return {
        id: String(grupo.idReporte),
        tipo: grupo._id.tipo,
        total: grupo.total,
        motivos,
        detalles: grupo.detalles.filter(Boolean).slice(0, 3),
        ultimo: grupo.ultimo,
        video: video ? { id: String(video._id), url: video.url, miniatura: video.miniatura, descripcion: video.descripcion } : null,
        comentario: comentario ? { id: String(comentario._id), texto: comentario.texto } : null,
        usuario: usuario ? { ...usuarioPublico(usuario, ahora), suspendida: usuario.suspendida } : null,
        resolucion: grupo.resolucion?.accion ? { accion: grupo.resolucion.accion, fecha: grupo.resolucion.fecha } : null,
      };
    }),
    hayMas: grupos.length > limite,
    pendientes,
  });
}

/** Elimina el contenido reportado, suspende a su autor o descarta los reportes (todos los del mismo contenido). */
export async function resolverReporte(req, res) {
  const accion = req.body?.accion;
  if (!ACCIONES.includes(accion)) throw ApiError.solicitudInvalida('Elige una acción: eliminar, suspender o descartar');
  const reporte = await Reporte.findById(req.params.id).lean();
  if (!reporte) throw ApiError.noEncontrado('El reporte no existe');
  if (reporte.estado !== 'pendiente') throw ApiError.conflicto('Este reporte ya se resolvió');
  if (accion === 'eliminar' && reporte.tipo === 'usuario') {
    throw ApiError.solicitudInvalida('Una cuenta no se elimina: suspéndela');
  }

  let autor = null;
  if (accion === 'suspender') {
    autor = await Usuario.findById(reporte.usuario).select('username').lean();
    if (autor && (autor._id.equals(req.usuario._id) || esAdmin(autor))) {
      throw ApiError.solicitudInvalida('No puedes suspender a un administrador');
    }
  }

  const resolucion = { accion, por: req.usuario._id, fecha: new Date() };
  const estado = accion === 'descartar' ? 'descartado' : 'resuelto';
  // Al suspender se cierran también los reportes de su otro contenido: queda oculto mientras dure.
  const filtro = accion === 'suspender' ? { usuario: reporte.usuario } : claveObjetivo(reporte);
  await Reporte.updateMany({ ...filtro, estado: 'pendiente' }, { $set: { estado, resolucion } });

  if (accion === 'suspender' && autor) {
    await Usuario.updateOne({ _id: autor._id }, { $set: { suspendida: true, suspendidaEn: new Date() } });
  } else if (accion === 'eliminar' && reporte.tipo === 'video') {
    const video = await Video.findById(reporte.video);
    if (video) {
      await eliminarVideoCompleto(video);
      // Como cuando lo borra su creador: si era parte de su racha, su progreso baja en 1.
      const creador = await Usuario.findById(video.autor);
      if (creador && video.estado === 'publicada') {
        registrarEliminacion(creador.insignia, video.publicadoEn);
        await creador.save();
      }
    }
  } else if (accion === 'eliminar') {
    const comentario = await Comentario.findById(reporte.comentario);
    if (comentario) await eliminarComentarioCompleto(comentario);
  }

  res.json({ resuelto: true, pendientes: await Reporte.countDocuments({ estado: 'pendiente' }) });
}

export async function listarSuspendidas(req, res) {
  const { limite, salto } = paginacion(req.query, { porDefecto: 20, maximo: 50 });
  const usuarios = await Usuario.find({ suspendida: true })
    .sort({ suspendidaEn: -1, _id: -1 })
    .skip(salto)
    .limit(limite + 1)
    .select(`${CAMPOS_AUTOR} suspendidaEn`)
    .lean();
  const ahora = new Date();
  res.json({
    usuarios: usuarios
      .slice(0, limite)
      .map((usuario) => ({ ...usuarioPublico(usuario, ahora), suspendidaEn: usuario.suspendidaEn })),
    hayMas: usuarios.length > limite,
  });
}

export async function reactivarCuenta(req, res) {
  const { matchedCount } = await Usuario.updateOne(
    { _id: req.params.id, suspendida: true },
    { $set: { suspendida: false, suspendidaEn: null } },
  );
  if (!matchedCount) throw ApiError.noEncontrado('La cuenta no existe o no está suspendida');
  res.json({ reactivada: true });
}
