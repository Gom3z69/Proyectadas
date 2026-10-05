import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from './IconoInsignia'

/** Píldora con la insignia que se muestra a la par del nombre de usuario. */
export default function InsigniaChip({ insignia, tamano = 'md', className = '' }) {
  const estilo = ESTILOS_INSIGNIA[insignia?.nivel]
  if (!estilo) return null

  const apagada = insignia.estado === 'apagada'
  const pequena = tamano === 'sm'

  return (
    <span
      title={apagada ? `Insignia ${estilo.nombre} apagada` : `Insignia ${estilo.nombre}`}
      className={`inline-flex shrink-0 items-center rounded-full bg-surface-container-high/90 backdrop-blur-md ${
        pequena ? 'gap-1 px-1.5 py-0.5' : 'gap-1.5 px-2 py-0.5'
      } ${apagada ? 'opacity-70' : ''} ${className}`}
      style={apagada ? undefined : { boxShadow: `0 0 12px ${estilo.brillo}59` }}
    >
      <IconoInsignia nivel={insignia.nivel} tamano={pequena ? 12 : 14} apagada={apagada} brillo={false} />
      <span
        className={`font-label-sm text-label-sm font-bold tracking-wider uppercase ${
          apagada ? 'text-outline line-through decoration-1' : estilo.claseTexto
        }`}
      >
        {estilo.nombre}
      </span>
    </span>
  )
}
