import { peticion } from './api'

export const registrar = (datos) => peticion('/auth/registro', { metodo: 'POST', datos })

export const iniciarSesion = (identificador, password) =>
  peticion('/auth/login', { metodo: 'POST', datos: { identificador, password } })

export const obtenerSesion = () => peticion('/auth/yo')
