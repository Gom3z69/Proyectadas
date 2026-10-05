import { useEffect, useId, useRef } from 'react'

// Pila de capas abiertas: Escape cierra solo la de encima.
const pila = []

export const hayCapaAbierta = () => pila.length > 0

/** Bloquea el scroll del fondo, cierra con Escape y devuelve el foco al cerrar. */
export function useCapaModal(abierta, onCerrar, refEnfoque) {
  const id = useId()
  const cerrar = useRef(onCerrar)

  useEffect(() => {
    cerrar.current = onCerrar
  })

  useEffect(() => {
    if (!abierta) return
    pila.push(id)
    document.body.style.overflow = 'hidden'
    const enfocadoAntes = document.activeElement
    refEnfoque?.current?.focus({ preventScroll: true })

    const alPresionar = (evento) => {
      if (evento.key === 'Escape' && pila.at(-1) === id) cerrar.current?.()
    }
    window.addEventListener('keydown', alPresionar)

    return () => {
      window.removeEventListener('keydown', alPresionar)
      pila.splice(pila.indexOf(id), 1)
      if (pila.length === 0) document.body.style.overflow = ''
      if (enfocadoAntes instanceof HTMLElement) enfocadoAntes.focus({ preventScroll: true })
    }
  }, [abierta, id, refEnfoque])
}
