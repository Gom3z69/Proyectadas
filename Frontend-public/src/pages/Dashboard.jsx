import { useSearchParams } from 'react-router'
import BarraFiltros from '../components/feed/BarraFiltros'
import Feed from '../components/feed/Feed'
import { tipoFeed } from '../utils/feed'

/** Inicio: feed vertical de proyectadas (Tendencias, Siguiendo o Élite Gran Maestro). */
export default function Dashboard() {
  const [parametros, setParametros] = useSearchParams()
  const tipo = tipoFeed(parametros.get('feed'))

  function cambiarTipo(nuevo) {
    setParametros(nuevo === 'para-ti' ? {} : { feed: nuevo }, { replace: true })
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-5rem)] w-full max-w-[1680px] flex-col px-4 pt-4 pb-28 md:px-6 md:pb-4 lg:px-8">
      <BarraFiltros tipo={tipo} onCambiar={cambiarTipo} />
      {/* key: al cambiar de pestaña se reinicia el feed (paginación, video activo...). */}
      <Feed key={tipo} tipo={tipo} />
    </div>
  )
}
