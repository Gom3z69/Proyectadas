import { peticion } from './api'

/** Comentarios principales de una proyectada. orden: 'votados' (más me gusta) o 'recientes'. */
export const listarComentarios = (videoId, pagina = 1, orden = 'votados') =>
  peticion(`/videos/${videoId}/comentarios?pagina=${pagina}&limite=20&orden=${orden}`)

/** Respuestas de un comentario principal, de la más antigua a la más reciente. */
export const listarRespuestas = (comentarioId, pagina = 1) =>
  peticion(`/comentarios/${comentarioId}/respuestas?pagina=${pagina}&limite=10`)

/** Comenta la proyectada; con `respuestaA` responde a ese comentario. */
export const comentar = (videoId, texto, respuestaA) =>
  peticion(`/videos/${videoId}/comentarios`, { metodo: 'POST', datos: respuestaA ? { texto, respuestaA } : { texto } })

export const eliminarComentario = (id) => peticion(`/comentarios/${id}`, { metodo: 'DELETE' })

export const darLikeComentario = (id) => peticion(`/comentarios/${id}/like`, { metodo: 'POST' })

export const quitarLikeComentario = (id) => peticion(`/comentarios/${id}/like`, { metodo: 'DELETE' })
