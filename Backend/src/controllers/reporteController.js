import Comentario from '../models/Comentario.js';
import Reporte, { MOTIVOS_REPORTE } from '../models/Reporte.js';
import Usuario from '../models/Usuario.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { esObjectId, texto } from '../utils/entrada.js';

const TIPOS = ['video', 'comentario', 'usuario'];

/** Datos del contenido reportado (y su autor) según el tipo. */
async function objetivo(tipo, id) {
  if (tipo === 'video') {
    const video = await Video.findOne({ _id: id, estado: 'publicada' }).select('autor').lean();
    if (!video) throw ApiError.noEncontrado('Esta proyectada no existe o fue eliminada');
    return { video: video._id, usuario: video.autor };
  }
  if (tipo === 'comentario') {
    const comentario = await Comentario.findById(id).select('autor video').lean();
    if (!comentario) throw ApiError.noEncontrado('El comentario no existe o fue eliminado');
    return { comentario: comentario._id, video: comentario.video, usuario: comentario.autor };
  }
  const usuario = await Usuario.findById(id).select('_id').lean();
  if (!usuario) throw ApiError.noEncontrado('Este usuario no existe');
  return { usuario: usuario._id };
}

/**
 * Reporta una proyectada, un comentario o una cuenta. Quien reporta deja de ver ese video o
 * comentario al instante; el equipo de moderación decide qué pasa después.
 */
export async function crearReporte(req, res) {
  const { tipo, id, motivo } = req.body ?? {};
  if (!TIPOS.includes(tipo)) throw ApiError.solicitudInvalida('Indica qué quieres reportar');
  if (!esObjectId(id)) throw ApiError.solicitudInvalida('Lo que quieres reportar no es válido');
  if (!MOTIVOS_REPORTE.includes(motivo)) throw ApiError.solicitudInvalida('Elige el motivo del reporte');

  const datos = await objetivo(tipo, id);
  if (datos.usuario.equals(req.usuario._id)) throw ApiError.solicitudInvalida('No puedes reportar tu propio contenido');

  try {
    await Reporte.create({ reportante: req.usuario._id, tipo, motivo, detalle: texto(req.body.detalle).slice(0, 300), ...datos });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res.json({ reportado: true, yaReportado: true });
  }
  res.status(201).json({ reportado: true });
}
