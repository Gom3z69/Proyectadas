import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import RangoCreador from '../components/insignias/RangoCreador'
import BannerPerfil from '../components/perfil/BannerPerfil'
import EstadoCargaPerfil from '../components/perfil/EstadoCargaPerfil'
import IdentidadPerfil from '../components/perfil/IdentidadPerfil'
import MenuPerfilAjeno from '../components/perfil/MenuPerfilAjeno'
import ModalRelaciones from '../components/perfil/ModalRelaciones'
import PerfilBloqueado from '../components/perfil/PerfilBloqueado'
import Icono from '../components/ui/Icono'
import ListaVideos from '../components/video/ListaVideos'
import ReproductorModal from '../components/video/ReproductorModal'
import { useAuth } from '../hooks/useAuth'
import { usePerfil } from '../hooks/usePerfil'
import { useToast } from '../hooks/useToast'
import { useVideoCompartido } from '../hooks/useVideoCompartido'
import { obtenerVideosDeUsuario } from '../services/usuarioService'
import { copiarAlPortapapeles } from '../utils/enlaces'
import { formatearNumero } from '../utils/formato'

const ORDENES = [
  { clave: 'populares', texto: 'Más populares' },
  { clave: 'recientes', texto: 'Más recientes' },
]

/** Perfil de otra persona (/u/:username). No aparece en el menú: se llega al tocar su nombre. */
export default function PerfilUsuario() {
  const { username = '' } = useParams()
  const { usuario } = useAuth()
  const { search } = useLocation()
  const normalizado = username.toLowerCase()

  if (normalizado === usuario.username) return <Navigate to={`/perfil${search}`} replace />
  return <PerfilAjeno key={normalizado} username={normalizado} />
}

function PerfilAjeno({ username }) {
  const toast = useToast()
  const { perfil, cargando, error, actualizar, recargar } = usePerfil(username)
  const compartido = useVideoCompartido()
  const [orden, setOrden] = useState('populares')
  const [relaciones, setRelaciones] = useState(null)

  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = await obtenerVideosDeUsuario(username, pagina, { orden })
      return { items: datos.videos, hayMas: datos.hayMas }
    },
    [username, orden],
  )

  if (cargando || error) return <EstadoCargaPerfil cargando={cargando} error={error} username={username} />
  if (perfil.bloqueadoPorMi) return <PerfilBloqueado perfil={perfil} onDesbloqueado={recargar} />

  function actualizarSeguimiento(resultado) {
    actualizar((actual) => ({
      siguiendo: resultado.siguiendo,
      estadisticas: { ...actual.estadisticas, seguidores: resultado.seguidores },
    }))
  }

  function seguirDesdeVideo(autorId, resultado) {
    if (autorId === perfil.id) actualizarSeguimiento(resultado)
  }

  async function compartirPerfil() {
    if (await copiarAlPortapapeles(`${window.location.origin}/u/${username}`)) toast.exito('Enlace del perfil copiado')
    else toast.error('No se pudo copiar el enlace')
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-7xl px-space-lg pt-6 pb-4 lg:px-margin">
        <Link
          to="/"
          className="group inline-flex items-center gap-space-sm rounded-full bg-surface-container-low px-4 py-2 text-on-surface-variant shadow-sm transition-all hover:bg-surface-container hover:text-on-surface"
        >
          <Icono nombre="arrow_back" className="text-lg text-primary transition-transform group-hover:-translate-x-1" />
          <span className="font-label-md text-label-md">Volver al Feed</span>
        </Link>
      </div>

      <BannerPerfil perfil={perfil} />
      <IdentidadPerfil
        perfil={perfil}
        onCambioSeguimiento={actualizarSeguimiento}
        onVerRelaciones={setRelaciones}
        onCompartir={compartirPerfil}
        opciones={<MenuPerfilAjeno perfil={perfil} onBloqueado={recargar} />}
      />
      <RangoCreador insignia={perfil.insignia} />

      <section className="mx-auto mt-space-xl w-full max-w-7xl px-space-lg lg:px-margin" aria-labelledby="titulo-publicas">
        <div className="flex flex-col justify-between gap-space-md pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-space-sm">
            <h2 id="titulo-publicas" className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
              Proyectadas Públicas
            </h2>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm text-primary">
              {formatearNumero(perfil.estadisticas.videos)}
            </span>
          </div>
          <div className="flex items-center gap-space-xs self-start rounded-full bg-surface-container-low p-1.5 shadow-inner sm:self-auto">
            {ORDENES.map((opcion) => (
              <button
                key={opcion.clave}
                type="button"
                onClick={() => setOrden(opcion.clave)}
                aria-pressed={orden === opcion.clave}
                className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${
                  orden === opcion.clave
                    ? 'bg-primary-container font-semibold text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        </div>
        <div className="pb-space-xl">
          <ListaVideos
            key={orden}
            cargarPagina={cargarPagina}
            variante="publico"
            vacio={{ icono: 'video_library', titulo: 'Sin proyectadas todavía', mensaje: `@${username} aún no publica videos.` }}
            onSeguirAutor={seguirDesdeVideo}
            onBloquearAutor={recargar}
          />
        </div>
      </section>

      {compartido.video && (
        <ReproductorModal
          videos={[compartido.video]}
          indice={0}
          onCambiarIndice={() => {}}
          onCerrar={compartido.cerrar}
          onActualizar={(_, cambios) => compartido.actualizar(cambios)}
          onSeguirAutor={(autorId, resultado) => {
            compartido.actualizar((video) => ({
              siguiendoAutor: resultado.siguiendo,
              autor: { ...video.autor, seguidores: resultado.seguidores },
            }))
            seguirDesdeVideo(autorId, resultado)
          }}
          onEliminado={compartido.cerrar}
          onOcultar={({ autorId }) => {
            compartido.cerrar()
            if (autorId) recargar()
          }}
        />
      )}

      <ModalRelaciones perfil={perfil} tipo={relaciones} onCambiarTipo={setRelaciones} onCerrar={() => setRelaciones(null)} />
    </div>
  )
}
