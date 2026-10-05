import { useEffect, useRef } from 'react'

/** Llama a `alClicFuera` cuando se hace clic fuera del elemento de `ref` (para cerrar menús). */
export function useClicFuera(ref, alClicFuera, activo = true) {
  const callback = useRef(alClicFuera)

  useEffect(() => {
    callback.current = alClicFuera
  })

  useEffect(() => {
    if (!activo) return
    const manejar = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) callback.current(evento)
    }
    document.addEventListener('pointerdown', manejar)
    return () => document.removeEventListener('pointerdown', manejar)
  }, [ref, activo])
}
