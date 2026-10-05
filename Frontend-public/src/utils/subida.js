// Reglas para subir proyectadas (el backend valida lo mismo).
export const LIMITE_VIDEO_MB = 100
export const LIMITE_IMAGEN_MB = 5
export const MAX_DESCRIPCION = 300

const TIPOS_POR_EXTENSION = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  ogv: 'video/ogg',
}

export const TIPOS_VIDEO = new Set(Object.values(TIPOS_POR_EXTENSION))
export const TIPOS_IMAGEN = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Algunos sistemas no informan el tipo del archivo: se deduce por la extensión. */
export function normalizarVideo(archivo) {
  if (archivo.type) return archivo
  const tipo = TIPOS_POR_EXTENSION[archivo.name.split('.').pop()?.toLowerCase()]
  return tipo ? new File([archivo], archivo.name, { type: tipo }) : archivo
}
