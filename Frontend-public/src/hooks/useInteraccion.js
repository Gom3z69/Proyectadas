import { useRef } from 'react'
import { darLikeComentario, quitarLikeComentario } from '../services/comentarioService'
import { darLike, guardarVideo, quitarGuardado, quitarLike } from '../services/videoService'
import { useToast } from './useToast'

/**
 * Alterna una interacción con un video o un comentario de forma optimista: la interfaz cambia
 * al instante y, si el servidor falla, se revierte. `onActualizar(cambios)` lo modifica en su lista.
 */
function useInteraccion(elemento, onActualizar, { campo, conteo, activar, desactivar }) {
  const enCurso = useRef(false)
  const toast = useToast()

  return async function alternar(forzar) {
    const nuevo = forzar ?? !elemento[campo]
    if (enCurso.current || nuevo === elemento[campo]) return
    enCurso.current = true

    const previo = { [campo]: elemento[campo], [conteo]: elemento[conteo] }
    onActualizar({ [campo]: nuevo, [conteo]: Math.max(0, previo[conteo] + (nuevo ? 1 : -1)) })
    try {
      onActualizar(nuevo ? await activar(elemento.id) : await desactivar(elemento.id))
    } catch (error) {
      onActualizar(previo)
      toast.error(error.message)
    } finally {
      enCurso.current = false
    }
  }
}

export const useMeGusta = (video, onActualizar) =>
  useInteraccion(video, onActualizar, { campo: 'meGusta', conteo: 'likesCount', activar: darLike, desactivar: quitarLike })

export const useGuardado = (video, onActualizar) =>
  useInteraccion(video, onActualizar, {
    campo: 'guardado',
    conteo: 'guardadosCount',
    activar: guardarVideo,
    desactivar: quitarGuardado,
  })

export const useMeGustaComentario = (comentario, onActualizar) =>
  useInteraccion(comentario, onActualizar, {
    campo: 'meGusta',
    conteo: 'likesCount',
    activar: darLikeComentario,
    desactivar: quitarLikeComentario,
  })
