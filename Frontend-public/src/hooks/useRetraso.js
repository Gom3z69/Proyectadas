import { useEffect, useState } from 'react'

/** Devuelve `valor` solo cuando deja de cambiar durante `ms` (para no buscar en cada tecla). */
export function useRetraso(valor, ms = 250) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(temporizador)
  }, [valor, ms])

  return retrasado
}
