// Guarda el token JWT en el navegador. Los try/catch cubren modo privado o almacenamiento bloqueado.
const CLAVE_TOKEN = 'proyectadas.token'

export const EVENTO_SESION_EXPIRADA = 'proyectadas:sesion-expirada'

export function leerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Sin almacenamiento disponible: la sesión dura hasta recargar la página.
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Nada que borrar.
  }
}
