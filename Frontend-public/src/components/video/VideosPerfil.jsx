import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { eliminarVideo } from '../../services/videoService'
import EstadoVacio from '../ui/EstadoVacio'
import ModalConfirmacion from '../ui/ModalConfirmacion'
import GridVideos from './GridVideos'
import ReproductorModal from './ReproductorModal'

const CONFIRMACIONES = {
  publicada: {
    titulo: '¿Eliminar esta proyectada?',
    mensaje:
      'Se borrarán el video, sus me gusta y sus comentarios. Si era parte de tu racha actual, tu progreso de insignia bajará en 1.',
  },
  borrador: {
    titulo: '¿Eliminar este borrador?',
    mensaje: 'Se borrará el video y no podrás recuperarlo. Como nunca se publicó, tu racha no cambia.',
  },
}

/**
 * Cuadrícula de una lista paginada de proyectadas (de useListaPaginada) con su reproductor.
 * - insigniaPropia: { nivel, estado } vigente del usuario; se aplica a sus videos ya cargados.
 * - permitirEliminar: muestra "Eliminar" en las tarjetas (Mis Proyectadas).
 * - onEditarBorrador(video): al tocar un borrador (los borradores no se reproducen).
 * - onVideoEliminado(respuesta, id) / onSeguirAutor(autorId, resultado): avisan al contenedor.
 * - onBloquearAutor(autorId): se bloqueó a un autor desde el reproductor.
 */
export default function VideosPerfil({
  lista,
  variante,
  vacio,
  insigniaPropia,
  permitirEliminar = false,
  onEditarBorrador,
  onVideoEliminado,
  onSeguirAutor,
  onBloquearAutor,
}) {
  const toast = useToast()
  const [indiceAbierto, setIndiceAbierto] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const videos = insigniaPropia
    ? lista.items.map((video) => (video.esMio ? { ...video, autor: { ...video.autor, insignia: insigniaPropia } } : video))
    : lista.items
  // El reproductor solo recorre las publicadas.
  const reproducibles = videos.filter((video) => video.estado !== 'borrador')

  function quitarDeLaLista(id, respuesta) {
    lista.quitarItem(id)
    setIndiceAbierto(null)
    onVideoEliminado?.(respuesta, id)
  }

  async function confirmarEliminacion() {
    setEliminando(true)
    try {
      const respuesta = await eliminarVideo(porEliminar.id)
      quitarDeLaLista(porEliminar.id, respuesta)
      setPorEliminar(null)
      toast.exito(respuesta.estado === 'borrador' ? 'Borrador eliminado' : 'Proyectada eliminada')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEliminando(false)
    }
  }

  if (!lista.cargando && !lista.error && videos.length === 0) {
    return <EstadoVacio compacto {...vacio} />
  }

  const confirmacion = CONFIRMACIONES[porEliminar?.estado] ?? CONFIRMACIONES.publicada

  return (
    <>
      <GridVideos
        videos={videos}
        variante={variante}
        onAbrir={(video) => setIndiceAbierto(reproducibles.findIndex((candidato) => candidato.id === video.id))}
        onEditar={onEditarBorrador}
        onEliminar={permitirEliminar ? setPorEliminar : undefined}
        hayMas={lista.hayMas}
        cargando={lista.cargando}
        onCargarMas={lista.cargarMas}
      />
      {lista.error && !lista.cargando && (
        <p className="py-4 text-center text-body-sm text-error">
          {lista.error}{' '}
          <button type="button" onClick={lista.cargarMas} className="font-bold underline">
            Reintentar
          </button>
        </p>
      )}

      {indiceAbierto !== null && reproducibles[indiceAbierto] && (
        <ReproductorModal
          videos={reproducibles}
          indice={indiceAbierto}
          onCambiarIndice={setIndiceAbierto}
          onCerrar={() => setIndiceAbierto(null)}
          onActualizar={lista.actualizarItem}
          onSeguirAutor={(autorId, resultado) => {
            lista.actualizarDonde(
              (video) => video.autor.id === autorId,
              (video) => ({ siguiendoAutor: resultado.siguiendo, autor: { ...video.autor, seguidores: resultado.seguidores } }),
            )
            onSeguirAutor?.(autorId, resultado)
          }}
          onEliminado={quitarDeLaLista}
          onOcultar={({ videoId, autorId }) => {
            lista.quitarDonde((video) => video.id === videoId || video.autor.id === autorId)
            setIndiceAbierto(null)
            if (autorId) onBloquearAutor?.(autorId)
          }}
        />
      )}

      <ModalConfirmacion
        abierto={Boolean(porEliminar)}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        textoConfirmar="Eliminar"
        peligroso
        procesando={eliminando}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  )
}
