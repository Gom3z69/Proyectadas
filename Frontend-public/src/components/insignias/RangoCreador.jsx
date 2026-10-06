import { useNivelesInsignia } from '../../hooks/useNivelesInsignia'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import Icono from '../ui/Icono'
import IconoInsignia from './IconoInsignia'

function chipRacha(insignia) {
  if (insignia.permanente) return { color: 'text-primary', texto: 'Rango permanente · Administración' }
  if (insignia.estado === 'activa') {
    const cantidad = `${insignia.progreso} ${insignia.progreso === 1 ? 'proyectada' : 'proyectadas'}`
    return { color: 'text-tertiary', texto: `Racha activa: ${cantidad} en su racha` }
  }
  if (insignia.estado === 'apagada') return { color: 'text-error', texto: 'Insignia apagada: aún puede revivirla' }
  return { color: 'text-outline', texto: 'Sin racha activa' }
}

/** "Insignias y Rango de Creador" (perfil de otra persona): las 6 insignias y en cuál va. */
export default function RangoCreador({ insignia }) {
  const niveles = useNivelesInsignia()
  const indiceActual = niveles.findIndex((nivel) => nivel.clave === insignia.nivel)
  const apagada = insignia.estado === 'apagada'
  const racha = chipRacha(insignia)

  return (
    <section className="mx-auto mt-space-lg w-full max-w-7xl px-space-lg lg:px-margin" aria-labelledby="titulo-rango">
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container p-space-lg shadow-lg">
        <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-space-sm">
            <Icono nombre="trophy" className="text-2xl text-primary" />
            <h2 id="titulo-rango" className="font-title-md text-title-md font-bold text-on-surface">
              Insignias y Rango de Creador
            </h2>
          </div>
          <div
            className={`inline-flex items-center gap-2 self-start rounded-full bg-surface-container-high px-3 py-1.5 shadow-sm sm:self-auto ${racha.color}`}
          >
            <Icono nombre="local_fire_department" relleno className="text-base" />
            <span className="font-label-sm text-label-sm font-bold tracking-wide uppercase">{racha.texto}</span>
          </div>
        </div>

        <ol className="grid grid-cols-2 gap-space-sm pt-2 sm:grid-cols-3 md:grid-cols-6">
          {niveles.map((nivel, indice) => {
            const estilo = ESTILOS_INSIGNIA[nivel.clave]
            const actual = indice === indiceActual

            if (actual) {
              return (
                <li
                  key={nivel.clave}
                  className="group relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-high p-3 text-center shadow-xl"
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-primary/10 via-secondary/5 to-transparent" />
                  <span
                    className={`relative mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest ring-2 transition-transform group-hover:scale-110 ${
                      apagada ? 'ring-outline-variant' : 'ring-primary shadow-[0_0_16px_rgba(208,188,255,0.6)]'
                    }`}
                  >
                    <IconoInsignia nivel={nivel.clave} tamano={30} apagada={apagada} />
                  </span>
                  <span className={`relative font-label-sm text-label-sm font-bold ${apagada ? 'text-outline' : estilo.claseTexto}`}>
                    {nivel.nombre}
                  </span>
                  <span
                    className={`relative mt-0.5 flex items-center gap-0.5 font-label-sm text-label-sm font-bold ${apagada ? 'text-error' : 'text-secondary'}`}
                  >
                    <Icono nombre={apagada ? 'local_fire_department' : 'stars'} relleno className="text-xs" />
                    {apagada ? 'Apagada' : 'Rango actual'}
                  </span>
                </li>
              )
            }

            const desbloqueado = indice < indiceActual
            return (
              <li
                key={nivel.clave}
                className={`group flex flex-col items-center rounded-xl bg-surface-container-low p-3 text-center transition-all hover:bg-surface-container-high ${
                  desbloqueado ? '' : 'opacity-60'
                }`}
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container shadow-md transition-transform group-hover:scale-105">
                  <IconoInsignia nivel={nivel.clave} tamano={28} apagada={!desbloqueado} />
                </span>
                <span className={`font-label-sm text-label-sm font-bold ${desbloqueado ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {nivel.nombre}
                </span>
                <span
                  className={`mt-0.5 flex items-center gap-0.5 font-label-sm text-label-sm ${desbloqueado ? 'text-tertiary' : 'text-outline'}`}
                >
                  <Icono nombre={desbloqueado ? 'done' : 'lock'} className="text-xs" />
                  {desbloqueado ? 'Desbloqueado' : `${nivel.minimo} ${nivel.minimo === 1 ? 'proyectada' : 'proyectadas'}`}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
