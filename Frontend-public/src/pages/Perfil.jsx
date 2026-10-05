import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import CaminoInsignias from '../components/insignias/CaminoInsignias'
import CabeceraPerfil from '../components/perfil/CabeceraPerfil'
import EstadoCargaPerfil from '../components/perfil/EstadoCargaPerfil'
import ModalEditarPerfil from '../components/perfil/ModalEditarPerfil'
import ModalRelaciones from '../components/perfil/ModalRelaciones'
import PestanasVideos from '../components/perfil/PestanasVideos'
import ListaVideos from '../components/video/ListaVideos'
import ReproductorModal from '../components/video/ReproductorModal'
import { useAuth } from '../hooks/useAuth'
import { usePerfil } from '../hooks/usePerfil'
import { useToast } from '../hooks/useToast'
import { useVideoCompartido } from '../hooks/useVideoCompartido'
import { revivirInsignia } from '../services/insigniaService'
import {
  obtenerMisGuardados,
  obtenerMisMeGusta,
  obtenerMisVideos,
  obtenerVideosDeUsuario,
} from '../services/usuarioService'
import { copiarAlPortapapeles } from '../utils/enlaces'

const VACIOS = {
  proyectadas: {
    icono: 'video_library',
    titulo: 'Aún no publicas proyectadas',
    mensaje: 'Sube tu primera proyectada desde "Nueva Proyectada" para ganar la insignia Bronce.',
  },
  favoritos: {
    icono: 'bookmark',
    titulo: 'Aún no guardas proyectadas',
    mensaje: 'Toca el ícono de guardar en el feed y aparecerán aquí.',
  },
  'me-gusta': {
    icono: 'favorite',
    titulo: 'Aún no das me gusta',
    mensaje: 'Las proyectadas que te gusten aparecerán aquí.',
  },
  borradores: {
    icono: 'draft',
    titulo: 'No tienes borradores',
    mensaje: 'En Mis Proyectadas usa "Guardar como Borrador" para terminar una proyectada después.',
  },
}

/** Mi Perfil (diseño de STITCH): datos, Camino de Insignias y mis videos por pestañas. */
export default function Perfil() {
  const { usuario } = useAuth()
  return <PerfilPropio key={usuario.username} username={usuario.username} />
}

function PerfilPropio({ username }) {
  const { actualizarUsuario } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { perfil, cargando, error, recargar, actualizar } = usePerfil(username)
  const compartido = useVideoCompartido()
  const [pestana, setPestana] = useState('proyectadas')
  const [editando, setEditando] = useState(false)
  const [relaciones, setRelaciones] = useState(null)
  const [reviviendo, setReviviendo] = useState(false)

  const cargarPagina = useCallback(
    async (pagina) => {
      let datos
      if (pestana === 'favoritos') datos = await obtenerMisGuardados(pagina)
      else if (pestana === 'me-gusta') datos = await obtenerMisMeGusta(pagina)
      else if (pestana === 'borradores') datos = await obtenerMisVideos(pagina, { estado: 'borradores' })
      else datos = await obtenerVideosDeUsuario(username, pagina)
      return { items: datos.videos, hayMas: datos.hayMas }
    },
    [pestana, username],
  )

  if (cargando || error) return <EstadoCargaPerfil cargando={cargando} error={error} username={username} />

  async function revivir() {
    setReviviendo(true)
    try {
      const { insignia } = await revivirInsignia()
      actualizar({ insignia })
      actualizarUsuario({ insignia })
      toast.insignia(insignia.nivel, '¡Insignia revivida!', `Tienes 24 horas para publicar. Te quedan ${insignia.oportunidades} vidas este mes.`)
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setReviviendo(false)
    }
  }

  async function compartirPerfil() {
    if (await copiarAlPortapapeles(`${window.location.origin}/u/${username}`)) {
      toast.exito('Enlace de tu perfil copiado', 'Compártelo para que te sigan.')
    } else {
      toast.error('No se pudo copiar el enlace')
    }
  }

  function videoEliminado(respuesta) {
    actualizarUsuario({ insignia: respuesta.insignia })
    recargar()
  }

  const insigniaVisible = { nivel: perfil.insignia.nivel, estado: perfil.insignia.estado }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-xl px-space-md py-space-lg md:px-space-lg lg:px-margin">
      <CabeceraPerfil
        perfil={perfil}
        onEditar={() => setEditando(true)}
        onVerRelaciones={setRelaciones}
        onCompartir={compartirPerfil}
      />

      <CaminoInsignias
        insignia={perfil.insignia}
        esPropio
        username={username}
        onRevivir={revivir}
        reviviendo={reviviendo}
        onVencido={recargar}
      />

      <section className="flex flex-col gap-space-md" aria-label="Mis videos">
        <PestanasVideos
          activa={pestana}
          onCambiar={setPestana}
          totalProyectadas={perfil.estadisticas.videos}
          totalBorradores={perfil.estadisticas.borradores}
        />
        <ListaVideos
          key={pestana}
          cargarPagina={cargarPagina}
          variante="perfil"
          vacio={VACIOS[pestana]}
          insigniaPropia={insigniaVisible}
          onEditarBorrador={(video) => navigate(`/mis-proyectadas?borrador=${video.id}`)}
          onVideoEliminado={videoEliminado}
        />
      </section>

      {compartido.video && (
        <ReproductorModal
          videos={[compartido.video]}
          indice={0}
          onCambiarIndice={() => {}}
          onCerrar={compartido.cerrar}
          onActualizar={(_, cambios) => compartido.actualizar(cambios)}
          onSeguirAutor={(_, resultado) =>
            compartido.actualizar((video) => ({
              siguiendoAutor: resultado.siguiendo,
              autor: { ...video.autor, seguidores: resultado.seguidores },
            }))
          }
          onEliminado={(_, respuesta) => {
            compartido.cerrar()
            videoEliminado(respuesta)
          }}
        />
      )}

      {editando && (
        <ModalEditarPerfil
          perfil={perfil}
          onCerrar={() => setEditando(false)}
          onGuardado={(datos) => actualizar({ nombre: datos.nombre, bio: datos.bio, avatar: datos.avatar })}
        />
      )}

      <ModalRelaciones perfil={perfil} tipo={relaciones} onCambiarTipo={setRelaciones} onCerrar={() => setRelaciones(null)} />
    </div>
  )
}
