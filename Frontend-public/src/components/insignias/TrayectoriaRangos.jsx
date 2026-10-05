import { useNivelesInsignia } from '../../hooks/useNivelesInsignia'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import Icono from '../ui/Icono'
import IconoInsignia from './IconoInsignia'

// Contenedor de cada nodo según la forma de la insignia (como en el diseño).
const REDONDEO = { circulo: 'rounded-full', diamante: 'rounded-xl', rombo: 'rounded-lg', corona: 'rounded-full' }

/** "Trayectoria de Rangos": de Bronce (menor) a Gran Maestro (mayor), según las proyectadas de la racha. */
export default function TrayectoriaRangos({ insignia, className = '' }) {
  const niveles = useNivelesInsignia()
  const indiceActual = niveles.findIndex((nivel) => nivel.clave === insignia.nivel)
  const apagada = insignia.estado === 'apagada'
  const { siguiente } = insignia

  // Relleno de la línea: de 0 (primer nodo) a 1 (último nodo).
  const avance =
    indiceActual < 0 ? 0 : Math.min(1, (indiceActual + (siguiente ? insignia.porcentajeSiguiente / 100 : 0)) / (niveles.length - 1))
  const margen = 100 / niveles.length / 2
  const avanceHito = siguiente ? Math.min(100, (insignia.progreso / siguiente.minimo) * 100) : 100

  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container p-space-lg shadow-lg ${className}`}>
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-2">
        <span className="font-label-md text-label-md font-bold tracking-wider text-on-surface-variant uppercase">
          Trayectoria de rangos
        </span>
        <span className="font-label-sm text-label-sm text-primary">
          {siguiente
            ? `Próximo objetivo: ${siguiente.nombre} (${siguiente.minimo} ${siguiente.minimo === 1 ? 'proyectada' : 'proyectadas'})`
            : '¡Rango máximo alcanzado!'}
        </span>
      </div>

      <div className="sin-scrollbar relative w-full overflow-x-auto py-space-md">
        <ol
          className="relative grid min-w-[620px] px-4"
          style={{ gridTemplateColumns: `repeat(${niveles.length}, minmax(0, 1fr))` }}
        >
          <span
            className="absolute top-[26px] z-0 h-1 bg-surface-container-highest"
            style={{ left: `${margen}%`, right: `${margen}%` }}
            aria-hidden="true"
          />
          <span
            className={`absolute top-[26px] z-0 h-1 bg-gradient-to-r from-tertiary via-secondary to-primary-container transition-[width] duration-700 ${apagada ? 'grayscale' : ''}`}
            style={{ left: `${margen}%`, width: `calc(${avance} * (100% - ${margen * 2}%))` }}
            aria-hidden="true"
          />

          {niveles.map((nivel, indice) => {
            const estilo = ESTILOS_INSIGNIA[nivel.clave]
            const alcanzado = indice < indiceActual
            const actual = indice === indiceActual
            const bloqueado = indice > indiceActual

            return (
              <li
                key={nivel.clave}
                className={`group relative z-10 flex flex-col items-center gap-2 ${bloqueado ? 'opacity-60 transition-opacity hover:opacity-100' : ''}`}
              >
                <span className="flex h-14 items-center justify-center">
                  <span
                    className={`relative flex items-center justify-center transition-transform group-hover:scale-110 ${REDONDEO[estilo.forma]} ${
                      actual ? `h-14 w-14 shadow-xl ${apagada ? '' : 'animate-pulse'}` : 'h-12 w-12 shadow-md'
                    }`}
                    style={{ backgroundColor: `${estilo.brillo}33` }}
                  >
                    <IconoInsignia
                      nivel={nivel.clave}
                      tamano={actual ? 38 : 30}
                      simple={!actual}
                      apagada={actual && apagada}
                      brillo={actual}
                    />
                    {alcanzado && (
                      <Icono nombre="check" className="absolute text-base font-bold text-surface-container-lowest" />
                    )}
                    {bloqueado && <Icono nombre="lock" className="absolute text-sm text-surface-container-lowest" />}
                  </span>
                </span>
                <span className="text-center">
                  <span
                    className={`block font-label-md text-label-md ${
                      actual ? `font-extrabold ${apagada ? 'text-outline' : estilo.claseTexto}` : bloqueado ? 'font-bold text-on-surface-variant' : 'font-bold text-on-surface'
                    }`}
                  >
                    {nivel.nombre}
                  </span>
                  <span
                    className={`font-label-sm text-label-sm ${actual ? 'font-semibold text-on-surface' : alcanzado ? 'text-tertiary' : 'text-outline'}`}
                  >
                    {actual
                      ? `${insignia.progreso} ${insignia.progreso === 1 ? 'proyectada' : 'proyectadas'} (${apagada ? 'Apagada' : 'Actual'})`
                      : `${nivel.minimo} ${nivel.minimo === 1 ? 'proyectada' : 'proyectadas'}${alcanzado ? ' ✓' : ''}`}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-space-md flex flex-col items-center justify-between gap-space-sm rounded-lg bg-surface-container-high p-space-sm sm:flex-row">
        <div className="flex items-center gap-space-sm">
          <Icono nombre="auto_graph" className="text-xl text-secondary" />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {siguiente ? (
              <>
                Progreso actual al siguiente hito:{' '}
                <strong className="text-on-surface">
                  {insignia.progreso}/{siguiente.minimo}
                </strong>{' '}
                proyectadas hacia <span className="font-bold text-primary">Rango {siguiente.nombre}</span>.
              </>
            ) : (
              <>
                Alcanzaste el <span className="font-bold text-primary">Rango {insignia.nombre}</span> con {insignia.progreso} {insignia.progreso === 1 ? 'proyectada' : 'proyectadas'}
                en tu racha.
              </>
            )}
          </span>
        </div>
        <div className="h-2 w-full shrink-0 overflow-hidden rounded-full bg-surface-container-lowest sm:w-44">
          <div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${avanceHito}%` }} />
        </div>
      </div>
    </div>
  )
}
