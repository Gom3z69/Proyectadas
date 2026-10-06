import { peticion } from './api'

/** Reportes agrupados por contenido. estado: 'pendiente' | 'resuelto' | 'descartado'. */
export const listarReportes = (estado = 'pendiente', pagina = 1) =>
  peticion(`/moderacion/reportes?estado=${estado}&pagina=${pagina}`)

/** accion: 'eliminar' (el contenido), 'suspender' (la cuenta) o 'descartar' (los reportes). */
export const resolverReporte = (id, accion) =>
  peticion(`/moderacion/reportes/${id}/resolver`, { metodo: 'POST', datos: { accion } })

export const listarSuspendidas = (pagina = 1) => peticion(`/moderacion/suspendidas?pagina=${pagina}`)

export const reactivarCuenta = (id) => peticion(`/moderacion/usuarios/${id}/reactivar`, { metodo: 'POST' })
