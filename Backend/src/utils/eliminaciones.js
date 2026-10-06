// Borrados en cascada compartidos por los dueños del contenido, el panel de moderación y la eliminación de cuentas.
import Bloqueo from '../models/Bloqueo.js';
import Comentario from '../models/Comentario.js';
import ComentarioLike from '../models/ComentarioLike.js';
import Guardado from '../models/Guardado.js';
import Like from '../models/Like.js';
import Notificacion from '../models/Notificacion.js';
import Reporte from '../models/Reporte.js';
import Seguimiento from '../models/Seguimiento.js';
import Usuario from '../models/Usuario.js';
import Video from '../models/Video.js';
import { borrarArchivo } from './almacenamiento.js';

const unicos = (ids) => [...new Map(ids.filter(Boolean).map((id) => [String(id), id])).values()];

/** Cierra los reportes pendientes de contenido que ya no existe. */
export function cerrarReportes(filtro, accion, por = null) {
  return Reporte.updateMany(
    { ...filtro, estado: 'pendiente' },
    { $set: { estado: 'resuelto', resolucion: { accion, por, fecha: new Date() } } },
  );
}

/** Borra una proyectada con lo que depende de ella: archivos, me gusta, guardados, comentarios y avisos. */
export async function eliminarVideoCompleto(video) {
  await Promise.all([
    Like.deleteMany({ video: video._id }),
    Guardado.deleteMany({ video: video._id }),
    Comentario.deleteMany({ video: video._id }),
    ComentarioLike.deleteMany({ video: video._id }),
    Notificacion.deleteMany({ video: video._id }),
    cerrarReportes({ video: video._id }, 'contenido_eliminado'),
    Video.deleteOne({ _id: video._id }),
  ]);
  await Promise.all([borrarArchivo(video.url), borrarArchivo(video.miniatura)]);
}

/** Borra un comentario (si es principal, también sus respuestas) y ajusta los contadores. Devuelve cuántos borró. */
export async function eliminarComentarioCompleto(comentario) {
  const ids = comentario.respuestaA
    ? [comentario._id]
    : [comentario._id, ...(await Comentario.distinct('_id', { respuestaA: comentario._id }))];

  await Promise.all([
    Comentario.deleteMany({ _id: { $in: ids } }),
    ComentarioLike.deleteMany({ comentario: { $in: ids } }),
    Notificacion.deleteMany({ comentario: { $in: ids } }),
    cerrarReportes({ comentario: { $in: ids } }, 'contenido_eliminado'),
    comentario.respuestaA &&
      Comentario.updateOne({ _id: comentario.respuestaA, respuestasCount: { $gt: 0 } }, { $inc: { respuestasCount: -1 } }),
    Video.updateOne(
      { _id: comentario.video },
      [{ $set: { comentariosCount: { $max: [0, { $subtract: ['$comentariosCount', ids.length] }] } } }],
      { updatePipeline: true },
    ),
  ]);
  return ids.length;
}

/** Vuelve a contar los comentarios de los videos y las respuestas de los comentarios indicados. */
async function recontarComentarios(videos, raices) {
  const [porVideo, porRaiz] = await Promise.all([
    Comentario.aggregate([{ $match: { video: { $in: videos } } }, { $group: { _id: '$video', total: { $sum: 1 } } }]),
    Comentario.aggregate([{ $match: { respuestaA: { $in: raices } } }, { $group: { _id: '$respuestaA', total: { $sum: 1 } } }]),
  ]);
  const totalVideo = new Map(porVideo.map((fila) => [String(fila._id), fila.total]));
  const totalRaiz = new Map(porRaiz.map((fila) => [String(fila._id), fila.total]));

  await Promise.all([
    videos.length &&
      Video.bulkWrite(
        videos.map((id) => ({
          updateOne: { filter: { _id: id }, update: { $set: { comentariosCount: totalVideo.get(String(id)) ?? 0 } } },
        })),
      ),
    raices.length &&
      Comentario.bulkWrite(
        raices.map((id) => ({
          updateOne: { filter: { _id: id }, update: { $set: { respuestasCount: totalRaiz.get(String(id)) ?? 0 } } },
        })),
      ),
  ]);
}

/**
 * Elimina una cuenta y todo su rastro: proyectadas, comentarios (con sus respuestas), me gusta,
 * guardados, seguidores, bloqueos, reportes y notificaciones, corrigiendo los contadores ajenos.
 */
export async function eliminarCuentaCompleta(usuario) {
  const id = usuario._id;

  // 1. Sus proyectadas y borradores, con todo lo que cuelga de ellos.
  for (const video of await Video.find({ autor: id })) await eliminarVideoCompleto(video);

  // 2. Sus comentarios en proyectadas ajenas. Un comentario principal se lleva sus respuestas.
  const propios = await Comentario.find({ autor: id }).select('video respuestaA').lean();
  const raices = propios.filter((comentario) => !comentario.respuestaA).map((comentario) => comentario._id);
  const respuestasDeRaices = raices.length
    ? await Comentario.find({ respuestaA: { $in: raices } }).select('video').lean()
    : [];
  const borrados = [...propios, ...respuestasDeRaices];
  if (borrados.length) {
    const ids = borrados.map((comentario) => comentario._id);
    await Promise.all([
      Comentario.deleteMany({ _id: { $in: ids } }),
      ComentarioLike.deleteMany({ comentario: { $in: ids } }),
      Notificacion.deleteMany({ comentario: { $in: ids } }),
      cerrarReportes({ comentario: { $in: ids } }, 'cuenta_eliminada'),
    ]);
    await recontarComentarios(
      unicos(borrados.map((comentario) => comentario.video)),
      unicos(propios.map((comentario) => comentario.respuestaA)),
    );
  }

  // 3. Sus me gusta, favoritos y me gusta a comentarios se descuentan de cada contador.
  const [likes, guardados, likesComentarios] = await Promise.all([
    Like.find({ usuario: id }).select('video').lean(),
    Guardado.find({ usuario: id }).select('video').lean(),
    ComentarioLike.find({ usuario: id }).select('comentario').lean(),
  ]);
  await Promise.all([
    Like.deleteMany({ usuario: id }),
    Guardado.deleteMany({ usuario: id }),
    ComentarioLike.deleteMany({ usuario: id }),
    Video.updateMany(
      { _id: { $in: likes.map((fila) => fila.video) }, likesCount: { $gt: 0 } },
      { $inc: { likesCount: -1 } },
    ),
    Video.updateMany(
      { _id: { $in: guardados.map((fila) => fila.video) }, guardadosCount: { $gt: 0 } },
      { $inc: { guardadosCount: -1 } },
    ),
    Comentario.updateMany(
      { _id: { $in: likesComentarios.map((fila) => fila.comentario) }, likesCount: { $gt: 0 } },
      { $inc: { likesCount: -1 } },
    ),
  ]);

  // 4. Relaciones, avisos y reportes.
  await Promise.all([
    Seguimiento.deleteMany({ $or: [{ seguidor: id }, { seguido: id }] }),
    Notificacion.deleteMany({ $or: [{ destinatario: id }, { actor: id }] }),
    Bloqueo.deleteMany({ $or: [{ bloqueador: id }, { bloqueado: id }] }),
    Reporte.deleteMany({ reportante: id }),
    cerrarReportes({ usuario: id }, 'cuenta_eliminada'),
  ]);

  await borrarArchivo(usuario.avatar);
  await Usuario.deleteOne({ _id: id });
}
