import { Link } from 'react-router'
import EstadoVacio from '../ui/EstadoVacio'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

/** Pantalla mientras carga un perfil, o el error si no existe / no hay conexión. */
export default function EstadoCargaPerfil({ cargando, error, username }) {
  if (cargando) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Spinner tamano={40} />
      </div>
    )
  }

  const noExiste = error?.status === 404
  return (
    <EstadoVacio
      icono={noExiste ? 'person_off' : 'wifi_off'}
      titulo={noExiste ? 'Este usuario no existe' : 'No se pudo cargar el perfil'}
      mensaje={noExiste ? `No encontramos a @${username}. Revisa el nombre o búscalo de nuevo.` : error?.message}
      className="min-h-[60dvh]"
    >
      <Link
        to="/"
        className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-lg text-label-lg font-bold text-on-primary"
      >
        <Icono nombre="home" className="text-lg" /> Volver al inicio
      </Link>
    </EstadoVacio>
  )
}
