// Niveles de insignia, de menor a mayor. `minimo` = videos publicados en la racha actual.
export const NIVELES_INSIGNIA = [
  { clave: 'bronce', nombre: 'Bronce', minimo: 1, forma: 'circulo' },
  { clave: 'plata', nombre: 'Plata', minimo: 10, forma: 'circulo' },
  { clave: 'oro', nombre: 'Oro', minimo: 50, forma: 'circulo' },
  { clave: 'diamante', nombre: 'Diamante', minimo: 100, forma: 'diamante' },
  { clave: 'rubi', nombre: 'Rubí', minimo: 200, forma: 'rombo' },
  { clave: 'gran_maestro', nombre: 'Gran Maestro', minimo: 500, forma: 'corona' },
];

export const REGLAS_RACHA = {
  // Tiempo máximo entre publicaciones para mantener la insignia encendida.
  horasParaPublicar: 24,
  // Una vez apagada, tiempo disponible para revivirla antes de perderla.
  horasParaRevivir: 24,
  // Oportunidades de revivir por mes; se reinician cada 1° de mes.
  oportunidadesPorMes: 3,
};
