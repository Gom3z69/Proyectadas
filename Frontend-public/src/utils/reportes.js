// Motivos para reportar (el backend valida las mismas claves).
export const MOTIVOS_REPORTE = [
  { clave: 'spam', texto: 'Spam o engaño' },
  { clave: 'acoso', texto: 'Acoso o bullying' },
  { clave: 'odio', texto: 'Discurso de odio' },
  { clave: 'violencia', texto: 'Violencia o actividades peligrosas' },
  { clave: 'sexual', texto: 'Contenido sexual' },
  { clave: 'suplantacion', texto: 'Suplantación de identidad' },
  { clave: 'derechos', texto: 'Infringe derechos de autor' },
  { clave: 'otro', texto: 'Otro motivo' },
]

export const textoMotivo = (clave) => MOTIVOS_REPORTE.find((motivo) => motivo.clave === clave)?.texto ?? clave
