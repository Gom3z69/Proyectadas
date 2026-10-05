import { formatearNumero } from '../../utils/formato'
import Icono from '../ui/Icono'

const PESTANAS_PERFIL = [
  { clave: 'proyectadas', texto: 'Proyectadas', icono: 'grid_view' },
  { clave: 'favoritos', texto: 'Favoritos', icono: 'bookmark' },
  { clave: 'me-gusta', texto: 'Con Me Gusta', icono: 'favorite' },
  { clave: 'borradores', texto: 'Borradores', icono: 'draft' },
]

/** Pestañas de videos del perfil propio: Proyectadas, Favoritos, Con Me Gusta y Borradores. */
export default function PestanasVideos({ activa, onCambiar, totalProyectadas, totalBorradores }) {
  const conteos = { proyectadas: totalProyectadas, borradores: totalBorradores }

  return (
    <div className="sin-scrollbar flex items-center gap-space-xs overflow-x-auto pb-space-xs" role="tablist">
      {PESTANAS_PERFIL.map((pestana) => {
        const seleccionada = pestana.clave === activa
        const conteo = conteos[pestana.clave]
        return (
          <button
            key={pestana.clave}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            onClick={() => onCambiar(pestana.clave)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-label-md text-label-md transition-all ${
              seleccionada
                ? 'bg-primary-container font-bold text-on-primary-container shadow-sm'
                : 'bg-surface-container font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Icono nombre={pestana.icono} className="text-lg" />
            {pestana.texto}
            {conteo != null && (
              <span
                className={`rounded-full font-bold ${pestana.clave === 'borradores' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'} ${
                  seleccionada ? 'bg-on-primary-container/20 text-on-primary-container' : 'bg-surface-container-highest text-outline'
                }`}
              >
                {formatearNumero(conteo)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
