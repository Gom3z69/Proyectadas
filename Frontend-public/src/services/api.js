import { EVENTO_SESION_EXPIRADA, leerToken } from '../utils/sesion'

// Vacío en desarrollo (Vite redirige /api y /uploads al backend). En producción: VITE_API_URL.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const SIN_CONEXION = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.'

export class ErrorApi extends Error {
  constructor(mensaje, status, detalles) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.detalles = detalles
  }
}

/** URL absoluta de un archivo subido (/uploads/...). */
export function urlArchivo(ruta) {
  if (!ruta) return ''
  return /^(https?:|blob:|data:)/.test(ruta) ? ruta : `${API_URL}${ruta}`
}

function cabecerasAutenticacion() {
  const token = leerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Un 401 con sesión guardada cierra la sesión; el mensaje dice por qué (expiró, cambió la contraseña...). */
function avisarSiExpiro(status, mensaje) {
  if (status === 401 && leerToken()) window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: mensaje }))
}

/**
 * Petición a la API. `datos` se envía como JSON y `formulario` como multipart (FormData).
 * Lanza ErrorApi con el mensaje del backend cuando la respuesta no es 2xx.
 */
export async function peticion(ruta, { metodo = 'GET', datos, formulario, senal } = {}) {
  const headers = cabecerasAutenticacion()
  let body
  if (formulario) {
    body = formulario
  } else if (datos !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(datos)
  }

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/api${ruta}`, { method: metodo, headers, body, signal: senal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ErrorApi(SIN_CONEXION, 0)
  }

  if (respuesta.status === 204) return null
  const json = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    avisarSiExpiro(respuesta.status, json?.error)
    throw new ErrorApi(json?.error ?? `Error ${respuesta.status}`, respuesta.status, json?.detalles)
  }
  return json
}

/** Envía un FormData reportando el porcentaje subido (fetch no expone el progreso de subida). */
export function peticionConProgreso(ruta, formulario, { onProgreso, senal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/api${ruta}`)
    for (const [nombre, valor] of Object.entries(cabecerasAutenticacion())) {
      xhr.setRequestHeader(nombre, valor)
    }

    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable) onProgreso?.(Math.round((evento.loaded / evento.total) * 100))
    }
    xhr.onload = () => {
      let json = null
      try {
        json = JSON.parse(xhr.responseText)
      } catch {
        // Respuesta vacía o no JSON.
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(json)
      avisarSiExpiro(xhr.status, json?.error)
      reject(new ErrorApi(json?.error ?? `Error ${xhr.status}`, xhr.status, json?.detalles))
    }
    xhr.onerror = () => reject(new ErrorApi(SIN_CONEXION, 0))
    xhr.onabort = () => reject(new DOMException('Subida cancelada', 'AbortError'))
    senal?.addEventListener('abort', () => xhr.abort(), { once: true })

    xhr.send(formulario)
  })
}
