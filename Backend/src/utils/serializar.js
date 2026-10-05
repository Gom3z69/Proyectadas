import config from '../../Config.js';
import ComentarioLike from '../models/ComentarioLike.js';
import Guardado from '../models/Guardado.js';
import Like from '../models/Like.js';
import Seguimiento from '../models/Seguimiento.js';
import { insigniaVisible, resumenInsignia } from './insignias.js';

// Campos del autor que se cargan con populate() para mostrar videos y comentarios.
export const CAMPOS_AUTOR = 'nombre username avatar insignia';

const mismoId = (a, b) => String(a) === String(b);

/** Datos públicos mínimos de un usuario (nombre, avatar e insignia vigente). */
export function usuarioPublico(usuario, ahora = new Date()) {
  return {
    id: String(usuario._id),
    nombre: usuario.nombre,
    username: usuario.username,
    avatar: usuario.avatar ?? '',
    insignia: insigniaVisible(usuario.insignia, ahora),
  };
}

/** Datos de la sesión del usuario autenticado. */
export function usuarioPrivado(usuario) {
  return {
    id: String(usuario._id),
    nombre: usuario.nombre,
    username: usuario.username,
    email: usuario.email,
    bio: usuario.bio,
    avatar: usuario.avatar,
    creadoEn: usuario.createdAt,
    insignia: resumenInsignia(usuario.insignia),
    // Puede entrar al panel de moderación.
    esAdmin: config.admins.includes(usuario.username),
  };
}

/**
 * Convierte videos (lean, con autor poblado) a la forma que consume el frontend,
 * agregando si el usuario actual les dio like o los guardó, si sigue al autor y los seguidores del autor.
 */
export async function serializarVideos(videos, usuarioActual) {
  const visibles = videos.filter((video) => video.autor);
  if (visibles.length === 0) return [];

  const yo = usuarioActual._id;
  const ids = visibles.map((v) => v._id);
  const autores = [...new Map(visibles.map((v) => [String(v.autor._id), v.autor._id])).values()];

  const [conLike, conGuardado, seguidos, seguidores] = await Promise.all([
    Like.distinct('video', { usuario: yo, video: { $in: ids } }),
    Guardado.distinct('video', { usuario: yo, video: { $in: ids } }),
    Seguimiento.distinct('seguido', { seguidor: yo, seguido: { $in: autores } }),
    Seguimiento.aggregate([
      { $match: { seguido: { $in: autores } } },
      { $group: { _id: '$seguido', total: { $sum: 1 } } },
    ]),
  ]);

  const meGusta = new Set(conLike.map(String));
  const guardados = new Set(conGuardado.map(String));
  const sigo = new Set(seguidos.map(String));
  const totalSeguidores = new Map(seguidores.map((fila) => [String(fila._id), fila.total]));
  const ahora = new Date();

  return visibles.map((video) => {
    const autorId = String(video.autor._id);
    return {
      id: String(video._id),
      estado: video.estado,
      url: video.url,
      miniatura: video.miniatura,
      descripcion: video.descripcion,
      hashtags: video.hashtags,
      duracion: video.duracion,
      likesCount: video.likesCount,
      comentariosCount: video.comentariosCount,
      guardadosCount: video.guardadosCount ?? 0,
      vistas: video.vistas,
      nivelInsignia: video.nivelInsignia ?? null,
      creadoEn: video.createdAt,
      publicadoEn: video.publicadoEn ?? null,
      actualizadoEn: video.updatedAt,
      autor: { ...usuarioPublico(video.autor, ahora), seguidores: totalSeguidores.get(autorId) ?? 0 },
      meGusta: meGusta.has(String(video._id)),
      guardado: guardados.has(String(video._id)),
      siguiendoAutor: sigo.has(autorId),
      esMio: mismoId(autorId, yo),
    };
  });
}

/**
 * Comentarios (con autor poblado) en la forma que consume el frontend: si el usuario actual
 * les dio me gusta y si puede eliminarlos (es su autor o el dueño del video).
 */
export async function serializarComentarios(comentarios, { usuarioActual, autorVideo }) {
  const visibles = comentarios.filter((comentario) => comentario.autor);
  if (visibles.length === 0) return [];

  const conLike = await ComentarioLike.distinct('comentario', {
    usuario: usuarioActual._id,
    comentario: { $in: visibles.map((comentario) => comentario._id) },
  });
  const meGusta = new Set(conLike.map(String));
  const ahora = new Date();

  return visibles.map((comentario) => ({
    id: String(comentario._id),
    texto: comentario.texto,
    creadoEn: comentario.createdAt,
    autor: usuarioPublico(comentario.autor, ahora),
    respuestaA: comentario.respuestaA ? String(comentario.respuestaA) : null,
    likesCount: comentario.likesCount ?? 0,
    respuestasCount: comentario.respuestasCount ?? 0,
    meGusta: meGusta.has(String(comentario._id)),
    puedeEliminar: mismoId(comentario.autor._id, usuarioActual._id) || mismoId(autorVideo, usuarioActual._id),
  }));
}
