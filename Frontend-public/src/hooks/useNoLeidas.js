import { useEffect, useState } from 'react'
import { contarNoLeidas } from '../services/notificacionService'

const CADA_MS = 60_000

/** Notificaciones sin leer: se consultan cada minuto y al volver a la pestaña. Devuelve [cantidad, setCantidad]. */
export function useNoLeidas() {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    let vigente = true
    const consultar = () => {
      if (document.visibilityState !== 'visible') return
      contarNoLeidas()
        .then((datos) => vigente && setNoLeidas(datos.noLeidas))
        .catch(() => {})
    }
    consultar()
    const intervalo = setInterval(consultar, CADA_MS)
    document.addEventListener('visibilitychange', consultar)
    return () => {
      vigente = false
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', consultar)
    }
  }, [])

  return [noLeidas, setNoLeidas]
}
