import { useNivelesInsignia } from '../../hooks/useNivelesInsignia'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from './IconoInsignia'

/** "Sistema de Insignias Oficial": los 6 niveles con las proyectadas que pide cada uno. */
export default function LeyendaInsignias({ className = '' }) {
  const niveles = useNivelesInsignia()

  return (
    <div className={`space-y-2 rounded-2xl bg-surface-container-lowest/70 p-3.5 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between text-on-surface-variant">
        <span className="font-label-sm text-label-sm font-bold tracking-wider text-outline uppercase">
          Sistema de Insignias Oficial
        </span>
        <span className="font-label-sm text-label-sm text-primary">Niveles 1-{niveles.length}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 pt-1 text-center">
        {niveles.map((nivel, indice) => {
          const estilo = ESTILOS_INSIGNIA[nivel.clave]
          const maximo = indice === niveles.length - 1
          return (
            <div
              key={nivel.clave}
              title={`Nivel ${indice + 1}: ${nivel.nombre} (${nivel.minimo} ${nivel.minimo === 1 ? 'proyectada' : 'proyectadas'})`}
              className={`flex flex-col items-center gap-1 rounded-lg bg-surface-container/50 p-1 transition-colors hover:bg-surface-container ${
                maximo ? 'ring-1 ring-primary/40' : ''
              }`}
            >
              <IconoInsignia nivel={nivel.clave} tamano={16} />
              <span className={`w-full truncate font-label-sm text-[9px] ${estilo?.claseTexto ?? 'text-on-surface-variant'}`}>
                {nivel.nombre}
              </span>
              <span className="font-label-sm text-[9px] text-outline">{nivel.minimo}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
