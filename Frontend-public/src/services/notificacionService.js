import { peticion } from './api'

export const obtenerNotificaciones = (pagina = 1) => peticion(`/notificaciones?pagina=${pagina}&limite=15`)

export const contarNoLeidas = () => peticion('/notificaciones/no-leidas')

/** Marca como leídas hasta `hasta` (fecha ISO de la más reciente que se mostró). */
export const marcarLeidas = (hasta) => peticion('/notificaciones/leer', { metodo: 'POST', datos: hasta ? { hasta } : {} })
