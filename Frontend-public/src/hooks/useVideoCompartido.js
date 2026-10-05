import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { obtenerVideo } from '../services/videoService'
import { useToast } from './useToast'

/** Enlaces compartidos: /u/usuario?v=<id> abre directamente esa proyectada en el reproductor. */
export function useVideoCompartido() {
  const [parametros, setParametros] = useSearchParams()
  const videoId = parametros.get('v')
  const [video, setVideo] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (!videoId) return
    let vigente = true
    obtenerVideo(videoId)
      .then((datos) => vigente && setVideo(datos.video))
      .catch(() => vigente && toast.error('La proyectada compartida ya no existe.'))
    return () => {
      vigente = false
    }
  }, [videoId, toast])

  const cerrar = useCallback(() => {
    setVideo(null)
    setParametros({}, { replace: true })
  }, [setParametros])

  const actualizar = useCallback((cambios) => {
    setVideo((actual) => (actual ? { ...actual, ...(typeof cambios === 'function' ? cambios(actual) : cambios) } : actual))
  }, [])

  return { video, cerrar, actualizar }
}
