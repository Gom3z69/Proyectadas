import { peticion, peticionConProgreso } from './api'

export function obtenerFeed({ tipo = 'para-ti', pagina = 1, limite = 6, desde } = {}) {
  const parametros = new URLSearchParams({ tipo, pagina, limite })
  if (desde) parametros.set('desde', desde)
  return peticion(`/videos/feed?${parametros}`)
}

export const obtenerVideo = (id) => peticion(`/videos/${id}`)

/**
 * formulario: FormData con video, miniatura (opcional), descripcion y duracion.
 * Con `borrador=true` se guarda sin publicar.
 */
export const publicarVideo = (formulario, opciones) => peticionConProgreso('/videos', formulario, opciones)

/** Guarda la descripción y la portada (FormData) de un borrador. */
export const editarBorrador = (id, formulario, senal) =>
  peticion(`/videos/${id}`, { metodo: 'PATCH', formulario, senal })

/** Publica un borrador con sus últimos cambios (FormData): suma a la racha como cualquier publicación. */
export const publicarBorrador = (id, formulario, senal) =>
  peticion(`/videos/${id}/publicar`, { metodo: 'POST', formulario, senal })

export const eliminarVideo = (id) => peticion(`/videos/${id}`, { metodo: 'DELETE' })

export const darLike = (id) => peticion(`/videos/${id}/like`, { metodo: 'POST' })

export const quitarLike = (id) => peticion(`/videos/${id}/like`, { metodo: 'DELETE' })

export const guardarVideo = (id) => peticion(`/videos/${id}/guardar`, { metodo: 'POST' })

export const quitarGuardado = (id) => peticion(`/videos/${id}/guardar`, { metodo: 'DELETE' })

export const registrarVista = (id) => peticion(`/videos/${id}/vista`, { metodo: 'POST' })
