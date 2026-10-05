import { useEffect, useRef, useState } from 'react'

/**
 * Milisegundos que faltan para `objetivo` (fecha ISO), actualizados cada segundo; null si no hay objetivo.
 * `alLlegarACero` se llama una sola vez por objetivo cuando el plazo se cumple.
 */
export function useCuentaRegresiva(objetivo, alLlegarACero) {
  const destino = objetivo ? new Date(objetivo).getTime() : null
  const [ahora, setAhora] = useState(() => Date.now())
  const avisado = useRef(null)
  const restante = destino ? Math.max(0, destino - ahora) : null

  useEffect(() => {
    if (!destino) return
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [destino])

  useEffect(() => {
    if (restante === 0 && avisado.current !== objetivo) {
      avisado.current = objetivo
      alLlegarACero?.()
    }
  }, [restante, objetivo, alLlegarACero])

  return restante
}
