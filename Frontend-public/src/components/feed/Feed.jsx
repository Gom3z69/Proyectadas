import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { hayCapaAbierta } from '../../hooks/useCapaModal'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { obtenerFeed } from '../../services/videoService'
import PanelComentarios from '../comentarios/PanelComentarios'
import EstadoVacio from '../ui/EstadoVacio'
import Icono from '../ui/Icono'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import ControlesFeed from './ControlesFeed'
import FeedVideo from './FeedVideo'
import ProximasProyectadas from './ProximasProyectadas'

const VACIOS = {
  'para-ti': {
    icono: 'movie',
    titulo: 'Aún no hay proyectadas',
    mensaje: 'Sé la primera persona en publicar un video en PROYECTADAS.',
  },
  siguiendo: {
    icono: 'group',
    titulo: 'Nada por aquí todavía',
    mensaje: 'Sigue a creadores desde Tendencias o desde su perfil para ver aquí sus proyectadas.',
  },
  elite: {
    icono: 'auto_awesome',
    titulo: 'Nadie ha llegado a Gran Maestro',
    mensaje: 'Publica sin romper tu racha hasta reunir las proyectadas que pide la insignia máxima y sé el primero.',
  },
}

const ESCRITORIO_ANCHO = '(min-width: 1280px)'
const BOTON_PRINCIPAL =
  'flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-lg text-label-lg font-bold text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] transition-all hover:bg-primary-fixed active:scale-95'

/** Feed vertical tipo TikTok: un video por pantalla, con desplazamiento que encaja en cada uno. */
export default function Feed({ tipo }) {
  const { actualizarUsuario } = useAuth()
  const desde = useRef(null)
  const contenedor = useRef(null)

  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = await obtenerFeed({ tipo, pagina, desde: desde.current })
      desde.current = datos.desde
      return { items: datos.videos, hayMas: datos.hayMas }
    },
    [tipo],
  )

  const { items: videos, hayMas, cargando, error, cargarMas, actualizarItem, actualizarDonde, quitarItem, quitarDonde } =
    useListaPaginada(cargarPagina)

  const [indiceVisible, setIndiceVisible] = useState(0)
  const [silenciado, setSilenciado] = useState(true)
  const [autoAvance, setAutoAvance] = useState(false)
  const [modoCine, setModoCine] = useState(false)
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false)
  const [resaltarPanel, setResaltarPanel] = useState(false)

  // El índice puede apuntar a la tarjeta final ("llegaste al final"), que no es un video.
  const actual = videos[Math.min(indiceVisible, videos.length - 1)]
  const hayFinal = !hayMas && videos.length > 0

  // Detecta qué tarjeta ocupa la pantalla.
  useEffect(() => {
    const raiz = contenedor.current
    if (!raiz) return
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setIndiceVisible(Number(entrada.target.dataset.indice))
        }
      },
      { root: raiz, threshold: 0.6 },
    )
    raiz.querySelectorAll('[data-indice]').forEach((tarjeta) => observador.observe(tarjeta))
    return () => observador.disconnect()
  }, [videos.length, hayFinal])

  // Carga la siguiente página antes de llegar al final.
  useEffect(() => {
    if (hayMas && !cargando && !error && videos.length > 0 && indiceVisible >= videos.length - 3) cargarMas()
  }, [indiceVisible, videos.length, hayMas, cargando, error, cargarMas])

  const irA = useCallback((indice) => {
    const raiz = contenedor.current
    const destino = raiz?.querySelector(`[data-indice="${indice}"]`)
    if (destino) raiz.scrollTo({ top: destino.offsetTop, behavior: 'smooth' })
  }, [])

  // Flechas ↑ ↓ del teclado para cambiar de video.
  useEffect(() => {
    const alPresionar = (evento) => {
      if (hayCapaAbierta() || evento.target.closest?.('input, textarea, [role="slider"]')) return
      if (evento.key === 'ArrowDown') {
        evento.preventDefault()
        irA(indiceVisible + 1)
      } else if (evento.key === 'ArrowUp') {
        evento.preventDefault()
        irA(indiceVisible - 1)
      }
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [indiceVisible, irA])

  function abrirComentarios() {
    if (window.matchMedia(ESCRITORIO_ANCHO).matches && !modoCine) {
      // En escritorio el panel ya está a la derecha: se resalta y se enfoca el campo.
      setResaltarPanel(true)
      setTimeout(() => setResaltarPanel(false), 1200)
      document.getElementById('campo-comentario-feed')?.focus()
    } else {
      setComentariosAbiertos(true)
    }
  }

  function seguirAutor(autorId, resultado) {
    actualizarDonde(
      (video) => video.autor.id === autorId,
      (video) => ({ siguiendoAutor: resultado.siguiendo, autor: { ...video.autor, seguidores: resultado.seguidores } }),
    )
  }

  if (videos.length === 0) {
    if (cargando) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <Spinner tamano={40} />
        </div>
      )
    }
    if (error) {
      return (
        <EstadoVacio icono="wifi_off" titulo="No se pudo cargar el feed" mensaje={error} className="flex-1">
          <button type="button" onClick={cargarMas} className={BOTON_PRINCIPAL}>
            <Icono nombre="refresh" className="text-lg" /> Reintentar
          </button>
        </EstadoVacio>
      )
    }
    const vacio = VACIOS[tipo]
    return (
      <EstadoVacio icono={vacio.icono} titulo={vacio.titulo} mensaje={vacio.mensaje} className="flex-1">
        <Link to="/mis-proyectadas" className={BOTON_PRINCIPAL}>
          <Icono nombre="add_circle" className="text-lg" /> Subir proyectada
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <div className="flex min-h-0 w-full flex-1 items-stretch justify-center gap-6 lg:gap-10">
      <ControlesFeed
        className="hidden lg:flex"
        indice={indiceVisible}
        total={videos.length}
        hayMas={hayMas}
        onAnterior={() => irA(indiceVisible - 1)}
        onSiguiente={() => irA(indiceVisible + 1)}
        modoCine={modoCine}
        onModoCine={() => setModoCine((valor) => !valor)}
        autoAvance={autoAvance}
        onAutoAvance={() => setAutoAvance((valor) => !valor)}
      />

      <section className="relative h-full w-full max-w-[540px] min-w-0" aria-label="Feed de proyectadas">
        <div
          ref={contenedor}
          className="sin-scrollbar relative h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        >
          {videos.map((video, indice) => (
            <div key={video.id} data-indice={indice} className="h-full snap-start snap-always py-1">
              <FeedVideo
                video={video}
                activo={indice === indiceVisible}
                montarVideo={Math.abs(indice - indiceVisible) <= 2}
                silenciado={silenciado}
                onCambiarSonido={setSilenciado}
                onActualizar={(cambios) => actualizarItem(video.id, cambios)}
                onSeguirAutor={(resultado) => seguirAutor(video.autor.id, resultado)}
                onAbrirComentarios={abrirComentarios}
                onEliminado={(respuesta) => {
                  quitarItem(video.id)
                  actualizarUsuario({ insignia: respuesta.insignia })
                }}
                onOcultar={({ videoId, autorId }) => quitarDonde((v) => v.id === videoId || v.autor.id === autorId)}
                repetir={!autoAvance}
                onTerminado={() => irA(indice + 1)}
              />
            </div>
          ))}

          {hayMas && cargando && (
            <div className="flex h-24 items-center justify-center">
              <Spinner />
            </div>
          )}

          {hayFinal && (
            <div data-indice={videos.length} className="flex h-full snap-start snap-always items-center justify-center">
              <EstadoVacio
                icono="task_alt"
                titulo="¡Viste todas las proyectadas!"
                mensaje="Vuelve más tarde para ver lo nuevo, o sube la tuya para mantener viva tu racha."
              >
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => irA(0)}
                    className="flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-highest"
                  >
                    <Icono nombre="vertical_align_top" className="text-lg" /> Volver al inicio
                  </button>
                  <Link to="/mis-proyectadas" className={BOTON_PRINCIPAL}>
                    <Icono nombre="add_circle" className="text-lg" /> Subir proyectada
                  </Link>
                </div>
              </EstadoVacio>
            </div>
          )}
        </div>
      </section>

      {!modoCine && actual && (
        <aside className="sin-scrollbar hidden h-full w-[420px] shrink-0 flex-col gap-6 overflow-y-auto xl:flex 2xl:w-[460px]">
          <PanelComentarios
            key={actual.id}
            video={actual}
            idCampo="campo-comentario-feed"
            onConteo={(total) => actualizarItem(actual.id, { comentariosCount: total })}
            className={`h-[520px] shrink-0 transition-shadow duration-300 ${resaltarPanel ? 'ring-2 ring-primary-container' : ''}`}
          />
          <ProximasProyectadas
            videos={videos.slice(indiceVisible + 1, indiceVisible + 3)}
            indiceInicial={indiceVisible + 1}
            hayMas={hayMas}
            onElegir={irA}
          />
        </aside>
      )}

      <Modal abierto={comentariosAbiertos && Boolean(actual)} onCerrar={() => setComentariosAbiertos(false)} ancho="sm:max-w-xl">
        {actual && (
          <PanelComentarios
            key={actual.id}
            video={actual}
            plano
            onConteo={(total) => actualizarItem(actual.id, { comentariosCount: total })}
            className="h-[75dvh] sm:h-[640px]"
          />
        )}
      </Modal>
    </div>
  )
}
