// Apariencia de cada insignia. Los umbrales (videos necesarios) vienen del backend: GET /api/insignias/niveles
export const ESTILOS_INSIGNIA = {
  bronce: {
    nombre: 'Bronce',
    forma: 'circulo',
    degradado: ['#8C532B', '#CD7F32', '#E8B07A'],
    brillo: '#CD7F32',
    claseTexto: 'text-[#E1A36F]',
  },
  plata: {
    nombre: 'Plata',
    forma: 'circulo',
    degradado: ['#8E9EAB', '#F4F6F8', '#B8C0C8'],
    brillo: '#EAEAEA',
    claseTexto: 'text-[#E3E7EC]',
  },
  oro: {
    nombre: 'Oro',
    forma: 'circulo',
    degradado: ['#AA771C', '#FFD700', '#FBF5B7'],
    brillo: '#FFD700',
    claseTexto: 'text-[#F3C64F]',
  },
  diamante: {
    nombre: 'Diamante',
    forma: 'diamante',
    degradado: ['#03B5D3', '#4CD7F6', '#DDF8FF'],
    brillo: '#4CD7F6',
    claseTexto: 'text-secondary',
  },
  rubi: {
    nombre: 'Rubí',
    forma: 'rombo',
    degradado: ['#990029', '#E0115F', '#FF4D80'],
    brillo: '#E0115F',
    claseTexto: 'text-[#FF6584]',
  },
  gran_maestro: {
    nombre: 'Gran Maestro',
    forma: 'corona',
    degradado: ['#7B2CBF', '#4CD7F6', '#4EDEA3'],
    brillo: '#A078FF',
    claseTexto: 'bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent',
  },
}

// Respaldo mientras llegan los niveles del backend.
export const NIVELES_POR_DEFECTO = [
  { clave: 'bronce', nombre: 'Bronce', minimo: 1, forma: 'circulo' },
  { clave: 'plata', nombre: 'Plata', minimo: 10, forma: 'circulo' },
  { clave: 'oro', nombre: 'Oro', minimo: 50, forma: 'circulo' },
  { clave: 'diamante', nombre: 'Diamante', minimo: 100, forma: 'diamante' },
  { clave: 'rubi', nombre: 'Rubí', minimo: 200, forma: 'rombo' },
  { clave: 'gran_maestro', nombre: 'Gran Maestro', minimo: 500, forma: 'corona' },
]

// Respaldo de las reglas de la racha mientras llegan del backend.
export const REGLAS_POR_DEFECTO = { horasParaPublicar: 24, horasParaRevivir: 24, oportunidadesPorMes: 3 }

/** Degradado CSS del nivel, para anillos de avatar y barras de acento. */
export function degradadoInsignia(nivel, direccion = '135deg') {
  const estilo = ESTILOS_INSIGNIA[nivel]
  if (!estilo) return null
  const [a, b, c] = estilo.degradado
  return `linear-gradient(${direccion}, ${a}, ${b}, ${c})`
}
