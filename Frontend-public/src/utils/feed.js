export const PESTANAS_FEED = [
  { tipo: 'para-ti', texto: 'Tendencias', corto: 'Tendencias', icono: 'local_fire_department' },
  { tipo: 'siguiendo', texto: 'Siguiendo', corto: 'Siguiendo', icono: 'group' },
  { tipo: 'elite', texto: 'Élite Gran Maestro', corto: 'Élite', icono: 'auto_awesome' },
]

/** Tipo de feed a partir del parámetro ?feed= de la URL. */
export function tipoFeed(valor) {
  return PESTANAS_FEED.some((pestana) => pestana.tipo === valor) ? valor : 'para-ti'
}
