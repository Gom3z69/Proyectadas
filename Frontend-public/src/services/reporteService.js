import { peticion } from './api'

/** Reporta una proyectada, un comentario o una cuenta. tipo: 'video' | 'comentario' | 'usuario'. */
export const reportar = ({ tipo, id, motivo, detalle }) =>
  peticion('/reportes', { metodo: 'POST', datos: { tipo, id, motivo, detalle } })
