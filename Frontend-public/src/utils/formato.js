/** 950 → "950", 2430 → "2.4K", 142800 → "142.8K", 2400000 → "2.4M" */
export function formatearNumero(valor = 0) {
  const numero = Number(valor) || 0
  if (numero < 1000) return String(numero)
  const [base, sufijo] = numero < 999_500 ? [1e3, 'K'] : [1e6, 'M']
  const corto = numero / base
  return `${corto >= 100 ? Math.round(corto) : Number(corto.toFixed(1))}${sufijo}`
}

/** 75.4 → "1:15" */
export function formatearDuracion(segundos = 0) {
  if (!Number.isFinite(segundos) || segundos <= 0) return '0:00'
  const total = Math.floor(segundos)
  const minutos = Math.floor(total / 60)
  return `${minutos}:${String(total % 60).padStart(2, '0')}`
}

export function formatearBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** "ahora", "hace 12m", "hace 3h", "hace 2d", "hace 3 sem" o la fecha corta. */
export function tiempoRelativo(fecha) {
  const segundos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 1000))
  if (segundos < 60) return 'ahora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos}m`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias}d`
  if (dias < 30) return `hace ${Math.floor(dias / 7)} sem`
  return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Milisegundos → "5 h 20 min", "12 min 05 s" o "40 s". */
export function formatearRestante(ms) {
  if (ms == null) return ''
  const total = Math.max(0, Math.floor(ms / 1000))
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const segundos = total % 60
  if (horas > 0) return `${horas} h ${String(minutos).padStart(2, '0')} min`
  if (minutos > 0) return `${minutos} min ${String(segundos).padStart(2, '0')} s`
  return `${segundos} s`
}

/** Milisegundos → "08h : 24m : 12s" (reloj de la regla de 24 horas). */
export function formatearReloj(ms) {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000))
  const dos = (numero) => String(numero).padStart(2, '0')
  return `${dos(Math.floor(total / 3600))}h : ${dos(Math.floor((total % 3600) / 60))}m : ${dos(total % 60)}s`
}

/** Para tarjetas de video: "Ahora", "5h", "Ayer", "3d", "2 sem" o la fecha corta. */
export function tiempoCorto(fecha) {
  const horas = Math.floor((Date.now() - new Date(fecha).getTime()) / 3_600_000)
  if (horas < 1) return 'Ahora'
  if (horas < 24) return `${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `${dias}d`
  if (dias < 30) return `${Math.floor(dias / 7)} sem`
  return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/** "octubre de 2026" */
export function formatearMesAnio(fecha) {
  return new Date(fecha).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}

export const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** "2026-11-01" → "1 de noviembre" (sin desfase por zona horaria). */
export function formatearDiaMes(fechaIso) {
  return new Date(`${fechaIso}T00:00:00Z`).toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatearHora(fecha) {
  return new Date(fecha).toLocaleString('es', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

/** 1 → "Falta 1", 13 → "Faltan 13". */
export const faltan = (cantidad) => `${cantidad === 1 ? 'Falta' : 'Faltan'} ${cantidad}`
