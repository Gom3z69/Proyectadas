import { peticion } from './api'

let nivelesEnCache = null

/** Niveles y reglas de la racha. Se piden una sola vez por sesión. */
export function obtenerNiveles() {
  nivelesEnCache ??= peticion('/insignias/niveles').catch((error) => {
    nivelesEnCache = null
    throw error
  })
  return nivelesEnCache
}

export const revivirInsignia = () => peticion('/insignias/revivir', { metodo: 'POST' })
