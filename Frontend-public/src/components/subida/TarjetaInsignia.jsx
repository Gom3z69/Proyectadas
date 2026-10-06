import { faltan } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import Icono from '../ui/Icono'

/** Insignia actual y lo que falta para la siguiente. */
export default function TarjetaInsignia({ insignia }) {
  const estilo = ESTILOS_INSIGNIA[insignia.nivel]
  const proyectadas = `${insignia.progreso} ${insignia.progreso === 1 ? 'proyectada' : 'proyectadas'}`

  // La insignia permanente (cuenta administradora) no depende de cuántas proyectadas lleva.
  let titulo = 'Todavía sin insignia'
  if (estilo) titulo = insignia.permanente ? `Insignia ${estilo.nombre}` : `Insignia ${estilo.nombre} · ${proyectadas}`

  let detalle = '¡Alcanzaste el rango máximo!'
  if (insignia.permanente) detalle = 'Permanente por ser cuenta administradora'
  else if (insignia.siguiente) {
    detalle = `${faltan(insignia.siguiente.faltan)} ${insignia.siguiente.faltan === 1 ? 'proyectada' : 'proyectadas'} para ${insignia.siguiente.nombre}`
  }

  return (
    <div className="relative flex items-center gap-space-md rounded-xl bg-surface-container-low p-space-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
        {estilo ? (
          <IconoInsignia nivel={insignia.nivel} tamano={28} apagada={insignia.estado === 'apagada'} />
        ) : (
          <Icono nombre="military_tech" className="text-2xl text-outline" />
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-title-md text-title-md text-on-surface">{titulo}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{detalle}</span>
      </div>
    </div>
  )
}
