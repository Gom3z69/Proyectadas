import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'
import TarjetaVideoEstudio from './TarjetaVideoEstudio'
import TarjetaVideoPerfil from './TarjetaVideoPerfil'
import TarjetaVideoPublica from './TarjetaVideoPublica'

// Cada pantalla de STITCH usa su propia tarjeta y su propia cuadrícula.
const VARIANTES = {
  perfil: {
    Tarjeta: TarjetaVideoPerfil,
    columnas: 'grid-cols-2 gap-space-sm sm:grid-cols-3 md:grid-cols-4 md:gap-space-md lg:grid-cols-5',
  },
  publico: {
    Tarjeta: TarjetaVideoPublica,
    columnas: 'grid-cols-2 gap-space-md sm:grid-cols-3 lg:grid-cols-4 lg:gap-space-lg',
  },
  estudio: {
    Tarjeta: TarjetaVideoEstudio,
    columnas: 'grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4',
  },
}

/**
 * Cuadrícula de proyectadas con el botón "Cargar más proyectadas". variante: 'perfil' | 'publico' | 'estudio'.
 * onAbrir(video) reproduce una publicada y onEditar(video) retoma un borrador.
 */
export default function GridVideos({ videos, variante = 'perfil', onAbrir, onEditar, onEliminar, hayMas, cargando, onCargarMas }) {
  const { Tarjeta, columnas } = VARIANTES[variante]

  return (
    <>
      <ul className={`grid ${columnas}`}>
        {videos.map((video) => (
          <li key={video.id}>
            <Tarjeta
              video={video}
              onAbrir={() => onAbrir(video)}
              onEditar={onEditar ? () => onEditar(video) : undefined}
              onEliminar={onEliminar ? () => onEliminar(video) : undefined}
            />
          </li>
        ))}
      </ul>

      {cargando && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
      {!cargando && hayMas && (
        <div className="mt-space-md flex justify-center">
          <button
            type="button"
            onClick={onCargarMas}
            className="flex items-center gap-2 rounded-full bg-surface-container px-6 py-2.5 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icono nombre="expand_more" className="text-base" /> Cargar más proyectadas
          </button>
        </div>
      )}
    </>
  )
}
