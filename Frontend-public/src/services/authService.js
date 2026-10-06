import { peticion } from './api'

export const registrar = (datos) => peticion('/auth/registro', { metodo: 'POST', datos })

export const iniciarSesion = (identificador, password) =>
  peticion('/auth/login', { metodo: 'POST', datos: { identificador, password } })

export const obtenerSesion = () => peticion('/auth/yo')

/** Pide el enlace para restablecer la contraseña. La respuesta es la misma exista o no el correo. */
export const solicitarRecuperacion = (email) => peticion('/auth/recuperar', { metodo: 'POST', datos: { email } })

/** Crea la contraseña nueva con el token del enlace; devuelve una sesión nueva. */
export const restablecerPassword = (token, password) =>
  peticion('/auth/restablecer', { metodo: 'POST', datos: { token, password } })
