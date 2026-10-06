import Comentario from '../models/Comentario.js';
import ComentarioLike from '../models/ComentarioLike.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { eliminarComentarioCompleto } from '../utils/eliminaciones.js';
import { esObjectId, paginacion, texto } from '../utils/entrada.js';
import { notificar, retirarNotificaciones } from '../utils/notificaciones.js';
import { CAMPOS_AUTOR, serializarComentarios } from '../utils/serializar.js';
import { autorOculto, contenidoOculto } from '../utils/visibilidad.js';

const NO_EXISTE = 'Esta proyectada no existe o fue eliminada';
const COMENTARIO_NO_EXISTE = 'El comentario no existe o fue eliminado';

// "Más votados" primero los de más me gusta; a igualdad, el más reciente.
const ORDENES = {
  recientes: { createdAt: -1, _id: -1 },
  votados: { likesCount: -1, createdAt: -1, _id: -1 },
};

/**
 * Los comentarios solo existen en proyectadas publicadas (no en borradores) que la persona
 * puede ver: no de cuentas bloqueadas o suspendidas.
 */
async function videoPublicado(id, campos, usuario) {
  const video = await Video.findOne({ _id: id, estado: 'publicada' }).select(`${campos} autor`).lean();
  if (!video || (await autorOculto(usuario._id, video.autor))) throw ApiError.noEncontrado(NO_EXISTE);
  return video;
}

/** Filtro de comentarios visibles: sin autores bloqueados o suspendidos ni los que la persona reportó. */
async function filtroVisibles(usuario) {
  const oculto = await contenidoOculto(usuario._id);
  return { autor: { $nin: oculto.autores }, _id: { $nin: oculto.comentarios } };
}

async function contarComentarios(videoId) {
  const video = await Video.findById(videoId).select('comentariosCount').lean();
  return video?.comentariosCount ?? 0;
}

/** Comentarios principales de una proyectada (las respuestas se piden por hilo). */
export async function listarComentarios(req, res) {
  const video = await videoPublicado(req.params.id, 'comentariosCount', req.usuario);
  const { limite, salto } = paginacion(req.query, { porDefecto: 20, maximo: 50 });
  const orden = Object.hasOwn(ORDENES, req.query.orden) ? ORDENES[req.query.orden] : ORDENES.recientes;

  const comentarios = await Comentario.find({ video: video._id, respuestaA: null, ...(await filtroVisibles(req.usuario)) })
    .sort(orden)
    .skip(salto)
    .limit(limite + 1)
    .populate('autor', CAMPOS_AUTOR)
    .lean();

  res.json({
    comentarios: await serializarComentarios(comentarios.slice(0, limite), {
      usuarioActual: req.usuario,
      autorVideo: video.autor,
    }),
    total: video.comentariosCount,
    hayMas: comentarios.length > limite,
  });
}

/** Respuestas de un comentario, de la más antigua a la más reciente (se leen como conversación). */
export async function listarRespuestas(req, res) {
  const raiz = await Comentario.findOne({ _id: req.params.id, respuestaA: null }).select('video').lean();
  if (!raiz) throw ApiError.noEncontrado(COMENTARIO_NO_EXISTE);
  const video = await videoPublicado(raiz.video, 'autor', req.usuario);
  const { limite, salto } = paginacion(req.query, { porDefecto: 10, maximo: 50 });

  const respuestas = await Comentario.find({ respuestaA: raiz._id, ...(await filtroVisibles(req.usuario)) })
    .sort({ createdAt: 1, _id: 1 })
    .skip(salto)
    .limit(limite + 1)
    .populate('autor', CAMPOS_AUTOR)
    .lean();

  res.json({
    respuestas: await serializarComentarios(respuestas.slice(0, limite), {
      usuarioActual: req.usuario,
      autorVideo: video.autor,
    }),
    hayMas: respuestas.length > limite,
  });
}

/** Comenta una proyectada o, con `respuestaA`, responde a un comentario. */
export async function crearComentario(req, res) {
  const contenido = texto(req.body?.texto);
  if (!contenido) throw ApiError.solicitudInvalida('Escribe un comentario');
  const video = await videoPublicado(req.params.id, 'autor', req.usuario);

  // Responder a una respuesta la suma al mismo hilo: solo hay un nivel de respuestas.
  let raiz = null;
  let destino = null;
  const respuestaA = req.body?.respuestaA;
  if (respuestaA != null) {
    if (!esObjectId(respuestaA)) throw ApiError.solicitudInvalida('El comentario que quieres responder no es válido');
    destino = await Comentario.findOne({ _id: respuestaA, video: video._id }).select('respuestaA autor').lean();
    if (!destino) throw ApiError.noEncontrado('El comentario que quieres responder ya no existe');
    if (await autorOculto(req.usuario._id, destino.autor)) throw ApiError.prohibido('No puedes responder a esta cuenta');
    raiz = destino.respuestaA ?? destino._id;
  }

  // Anti-spam: el mismo texto en la misma proyectada dentro de 2 minutos se considera repetido.
  const repetido = await Comentario.exists({
    video: video._id,
    autor: req.usuario._id,
    texto: contenido,
    createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) },
  });
  if (repetido) throw new ApiError(429, 'Ya publicaste ese mismo comentario hace un momento');

  const comentario = await Comentario.create({
    video: video._id,
    autor: req.usuario._id,
    texto: contenido,
    respuestaA: raiz,
  });
  await Promise.all([
    Video.updateOne({ _id: video._id }, { $inc: { comentariosCount: 1 } }),
    raiz && Comentario.updateOne({ _id: raiz }, { $inc: { respuestasCount: 1 } }),
  ]);

  // Avisa a quien recibió la respuesta y al creador del video (una sola vez a cada uno).
  const aviso = { actor: req.usuario._id, video: video._id, comentario: comentario._id };
  if (destino) await notificar({ ...aviso, destinatario: destino.autor, tipo: 'respuesta' });
  if (!destino?.autor.equals(video.autor)) {
    await notificar({ ...aviso, destinatario: video.autor, tipo: 'comentario' });
  }

  const [serializado] = await serializarComentarios([{ ...comentario.toObject(), autor: req.usuario }], {
    usuarioActual: req.usuario,
    autorVideo: video.autor,
  });
  res.status(201).json({ comentario: serializado, comentariosCount: await contarComentarios(video._id) });
}

async function leerLikes(comentarioId) {
  const comentario = await Comentario.findById(comentarioId).select('likesCount').lean();
  if (!comentario) throw ApiError.noEncontrado(COMENTARIO_NO_EXISTE);
  return comentario.likesCount ?? 0;
}

/** Me gusta a un comentario o a una respuesta. Es idempotente. */
export async function darLikeComentario(req, res) {
  const comentario = await Comentario.findById(req.params.id).select('video autor').lean();
  if (!comentario || (await autorOculto(req.usuario._id, comentario.autor))) {
    throw ApiError.noEncontrado(COMENTARIO_NO_EXISTE);
  }

  try {
    await ComentarioLike.create({ comentario: comentario._id, usuario: req.usuario._id, video: comentario.video });
    await Comentario.updateOne({ _id: comentario._id }, { $inc: { likesCount: 1 } });
    await notificar({
      destinatario: comentario.autor,
      actor: req.usuario._id,
      tipo: 'like_comentario',
      video: comentario.video,
      comentario: comentario._id,
    });
  } catch (error) {
    if (error.code !== 11000) throw error; // Ya le había dado me gusta: no se cuenta dos veces.
  }
  res.json({ meGusta: true, likesCount: await leerLikes(comentario._id) });
}

export async function quitarLikeComentario(req, res) {
  const { deletedCount } = await ComentarioLike.deleteOne({ comentario: req.params.id, usuario: req.usuario._id });
  if (deletedCount) {
    await Comentario.updateOne({ _id: req.params.id, likesCount: { $gt: 0 } }, { $inc: { likesCount: -1 } });
    await retirarNotificaciones({ actor: req.usuario._id, tipo: 'like_comentario', comentario: req.params.id });
  }
  res.json({ meGusta: false, likesCount: await leerLikes(req.params.id) });
}

/** Elimina un comentario (su autor o el dueño del video). Un comentario principal se lleva sus respuestas. */
export async function eliminarComentario(req, res) {
  const comentario = await Comentario.findById(req.params.id);
  if (!comentario) throw ApiError.noEncontrado(COMENTARIO_NO_EXISTE);

  const video = await Video.findById(comentario.video).select('autor').lean();
  const puedeEliminar =
    comentario.autor.equals(req.usuario._id) || Boolean(video?.autor.equals(req.usuario._id));
  if (!puedeEliminar) throw ApiError.prohibido('Solo puedes eliminar tus comentarios o los de tus proyectadas');

  const eliminados = await eliminarComentarioCompleto(comentario);

  res.json({
    eliminado: true,
    eliminados,
    comentariosCount: await contarComentarios(comentario.video),
  });
}
