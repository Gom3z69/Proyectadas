import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useClicFuera } from '../../hooks/useClicFuera'
import { useGuardado, useMeGusta } from '../../hooks/useInteraccion'
import { useToast } from '../../hooks/useToast'
import { urlArchivo } from '../../services/api'
import { eliminarVideo, registrarVista } from '../../services/videoService'
import { copiarAlPortapapeles, enlaceVideo, rutaPerfil } from '../../utils/enlaces'
import { formatearDuracion, formatearNumero } from '../../utils/formato'
import IconoInsignia from '../insignias/IconoInsignia'
import InsigniaChip from '../insignias/InsigniaChip'
import ModalBloqueo from '../moderacion/ModalBloqueo'
import ModalReporte from '../moderacion/ModalReporte'
import Avatar from '../ui/Avatar'
import BotonSeguir from '../ui/BotonSeguir'
import Icono from '../ui/Icono'
import ModalConfirmacion from '../ui/ModalConfirmacion'
import Spinner from '../ui/Spinner'
import MiniaturaVideo from '../video/MiniaturaVideo'
import AccionesVideo from './AccionesVideo'
import TextoConHashtags from './TextoConHashtags'

// Una vista por video y por sesión de la página.
const vistasRegistradas = new Set()
const DIA_MS = 24 * 60 * 60 * 1000
const claseBotonHud =
  'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high/70 text-on-surface backdrop-blur-md transition-transform hover:bg-surface-container-highest active:scale-90'
const claseOpcionMenu =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface'

/**
 * Una proyectada del feed: video 9:16 con su información y el riel de acciones.
 * Solo reproduce cuando `activo`. Con `montarVideo={false}` muestra la portada (ahorra memoria).
 */
export default function FeedVideo({
  video,
  activo,
  montarVideo = true,
  silenciado,
  onCambiarSonido,
  onActualizar,
  onSeguirAutor,
  onAbrirComentarios,
  onEliminado,
  onOcultar,
  onTerminado,
  repetir = true,
}) {
  const { usuario } = useAuth()
  const toast = useToast()
  const alternarMeGusta = useMeGusta(video, onActualizar)
  const alternarGuardado = useGuardado(video, onActualizar)
  const elemento = useRef(null)
  const temporizadorClic = useRef(null)
  const menu = useRef(null)
  const avisos = useRef({})
  const [reproduciendo, setReproduciendo] = useState(false)
  const [pausadoManual, setPausadoManual] = useState(false)
  const [esperando, setEsperando] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: video.duracion })
  const [horizontal, setHorizontal] = useState(false)
  const [corazones, setCorazones] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [reportando, setReportando] = useState(false)
  const [bloqueando, setBloqueando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [descripcionCompleta, setDescripcionCompleta] = useState(false)
  // Se calcula una vez al montar: marca como "Nueva" la proyectada de las últimas 24 h.
  const [esNueva] = useState(() => Date.now() - new Date(video.publicadoEn).getTime() < DIA_MS)

  useClicFuera(menu, () => setMenuAbierto(false), menuAbierto)

  // Guarda el callback más reciente para usarlo en efectos sin reiniciar la reproducción.
  useEffect(() => {
    avisos.current = { onCambiarSonido }
  })

  useEffect(() => {
    if (elemento.current) elemento.current.muted = silenciado
  }, [silenciado, montarVideo])

  useEffect(() => {
    const reproductor = elemento.current
    if (!reproductor) return
    if (!activo) {
      reproductor.pause()
      return
    }
    reproductor.currentTime = 0
    reproductor.play().catch(() => {
      if (reproductor.muted) return
      // El navegador bloqueó la reproducción con sonido: se silencia y se reintenta.
      reproductor.muted = true
      avisos.current.onCambiarSonido?.(true)
      reproductor.play().catch(() => {})
    })
  }, [activo, montarVideo])

  function alternarReproduccion() {
    const reproductor = elemento.current
    if (!reproductor) return
    if (reproductor.paused) {
      reproductor.play().catch(() => {})
    } else {
      reproductor.pause()
      setPausadoManual(true)
    }
  }

  function alTocarVideo(evento) {
    const caja = evento.currentTarget.getBoundingClientRect()
    const punto = { x: evento.clientX - caja.left, y: evento.clientY - caja.top }

    // Doble toque: me gusta con corazón animado (como en TikTok).
    if (temporizadorClic.current) {
      clearTimeout(temporizadorClic.current)
      temporizadorClic.current = null
      const id = `${Date.now()}-${punto.x}`
      setCorazones((lista) => [...lista, { id, ...punto }])
      setTimeout(() => setCorazones((lista) => lista.filter((corazon) => corazon.id !== id)), 900)
      alternarMeGusta(true)
      return
    }
    temporizadorClic.current = setTimeout(() => {
      temporizadorClic.current = null
      alternarReproduccion()
    }, 250)
  }

  function alReproducir() {
    setReproduciendo(true)
    setPausadoManual(false)
    if (activo && !vistasRegistradas.has(video.id)) {
      vistasRegistradas.add(video.id)
      registrarVista(video.id).catch(() => vistasRegistradas.delete(video.id))
      onActualizar({ vistas: video.vistas + 1 })
    }
  }

  function alActualizarTiempo(evento) {
    const reproductor = evento.currentTarget
    const total = Number.isFinite(reproductor.duration) && reproductor.duration > 0 ? reproductor.duration : video.duracion
    setProgreso({ actual: reproductor.currentTime, total })
  }

  function alCargarMetadatos(evento) {
    const reproductor = evento.currentTarget
    setHorizontal(reproductor.videoWidth > reproductor.videoHeight * 1.05)
    if (Number.isFinite(reproductor.duration) && reproductor.duration > 0) {
      setProgreso((previo) => ({ ...previo, total: reproductor.duration }))
    }
  }

  function saltarA(segundos) {
    const reproductor = elemento.current
    if (!reproductor || !progreso.total) return
    reproductor.currentTime = Math.min(progreso.total, Math.max(0, segundos))
    setProgreso((previo) => ({ ...previo, actual: reproductor.currentTime }))
  }

  function alHacerClicEnBarra(evento) {
    const caja = evento.currentTarget.getBoundingClientRect()
    saltarA(((evento.clientX - caja.left) / caja.width) * progreso.total)
  }

  function alPresionarEnBarra(evento) {
    if (evento.key === 'ArrowRight') saltarA(progreso.actual + 5)
    if (evento.key === 'ArrowLeft') saltarA(progreso.actual - 5)
  }

  async function compartir() {
    setMenuAbierto(false)
    if (await copiarAlPortapapeles(enlaceVideo(video))) {
      toast.exito('Enlace copiado', 'Compártelo para que vean esta proyectada.')
    } else {
      toast.error('No se pudo copiar el enlace')
    }
  }

  async function eliminar() {
    setEliminando(true)
    try {
      const respuesta = await eliminarVideo(video.id)
      setConfirmando(false)
      toast.exito('Proyectada eliminada')
      onEliminado?.(respuesta)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEliminando(false)
    }
  }

  const { autor } = video
  const perfil = rutaPerfil(autor.username, usuario)
  const porcentaje = progreso.total ? Math.min(100, (progreso.actual / progreso.total) * 100) : 0
  const sonido = `Sonido original · @${autor.username}`
  const acciones = {
    video,
    onMeGusta: () => alternarMeGusta(),
    onComentarios: onAbrirComentarios,
    onGuardar: () => alternarGuardado(),
    onCompartir: compartir,
  }

  return (
    <article className="relative flex h-full w-full items-center justify-center">
      <div className="flex h-full max-h-[820px] w-full items-end justify-center gap-4 lg:gap-6">
        {/* Pantalla vertical 9:16 */}
        <div className="group relative flex aspect-[9/16] h-full min-w-0 shrink flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl shadow-black/80 select-none">
          {horizontal && video.miniatura && (
            <img
              src={urlArchivo(video.miniatura)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            />
          )}

          {montarVideo ? (
            <video
              ref={elemento}
              src={urlArchivo(video.url)}
              poster={urlArchivo(video.miniatura) || undefined}
              loop={repetir}
              muted={silenciado}
              playsInline
              preload={activo ? 'auto' : 'metadata'}
              onPlay={alReproducir}
              onPause={() => setReproduciendo(false)}
              onWaiting={() => setEsperando(true)}
              onPlaying={() => setEsperando(false)}
              onTimeUpdate={alActualizarTiempo}
              onLoadedMetadata={alCargarMetadatos}
              onEnded={() => onTerminado?.()}
              className={`absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.01] ${
                horizontal ? 'object-contain' : 'object-cover'
              }`}
            />
          ) : (
            <MiniaturaVideo video={video} className="absolute inset-0" />
          )}

          {/* Degradados para que el texto se lea sobre cualquier video */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-surface-container-lowest/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent" />

          {/* Zona táctil: un toque pausa/reproduce, doble toque da me gusta */}
          <button
            type="button"
            onClick={alTocarVideo}
            aria-label={reproduciendo ? 'Pausar video' : 'Reproducir video'}
            className="absolute inset-0 z-0 cursor-pointer touch-manipulation outline-none"
          />

          {corazones.map((corazon) => (
            <span
              key={corazon.id}
              className="pointer-events-none absolute z-20 animate-corazon"
              style={{ left: corazon.x, top: corazon.y }}
            >
              <Icono nombre="favorite" relleno className="text-8xl text-error drop-shadow-[0_0_24px_rgba(255,180,171,0.8)]" />
            </span>
          ))}

          {/* HUD superior */}
          <div className="pointer-events-none relative z-10 flex items-center justify-between p-5 text-on-surface">
            <div className="flex items-center gap-2">
              {esNueva && (
                <span className="flex items-center gap-1 rounded-md bg-error/90 px-2.5 py-1 font-label-sm text-label-sm font-bold tracking-widest text-on-error uppercase shadow-md">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                  Nueva
                </span>
              )}
              <span className="flex items-center gap-1 rounded-md bg-surface-container-high/80 px-2.5 py-1 font-label-sm text-label-sm font-semibold backdrop-blur-md">
                <Icono nombre="visibility" className="text-xs text-secondary" />
                {formatearNumero(video.vistas)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCambiarSonido(!silenciado)}
                aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
                className={claseBotonHud}
              >
                <Icono nombre={silenciado ? 'volume_off' : 'volume_up'} className="text-lg" />
              </button>
              <div ref={menu} className="pointer-events-auto relative">
                <button
                  type="button"
                  onClick={() => setMenuAbierto((valor) => !valor)}
                  aria-label="Menú de opciones"
                  aria-expanded={menuAbierto}
                  className={claseBotonHud}
                >
                  <Icono nombre="more_vert" className="text-lg" />
                </button>
                {menuAbierto && (
                  <div className="absolute top-full right-0 z-30 mt-2 w-56 animate-aparecer rounded-2xl bg-surface-container-high p-1.5 shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40">
                    <Link to={perfil} className={claseOpcionMenu}>
                      <Icono nombre="person" className="text-xl" /> Ver perfil de @{autor.username}
                    </Link>
                    <button type="button" onClick={compartir} className={claseOpcionMenu}>
                      <Icono nombre="link" className="text-xl" /> Copiar enlace
                    </button>
                    {video.esMio && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuAbierto(false)
                          setConfirmando(true)
                        }}
                        className={`${claseOpcionMenu} hover:text-error`}
                      >
                        <Icono nombre="delete" className="text-xl" /> Eliminar proyectada
                      </button>
                    )}
                    {!video.esMio && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuAbierto(false)
                            setReportando(true)
                          }}
                          className={`${claseOpcionMenu} hover:text-error`}
                        >
                          <Icono nombre="flag" className="text-xl" /> Reportar proyectada
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuAbierto(false)
                            setBloqueando(true)
                          }}
                          className={`${claseOpcionMenu} hover:text-error`}
                        >
                          <Icono nombre="block" className="text-xl" /> Bloquear a @{autor.username}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {activo && (pausadoManual || esperando) && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              {pausadoManual ? (
                <span className="flex h-20 w-20 animate-aparecer items-center justify-center rounded-full bg-surface-container-highest/60 text-on-surface shadow-2xl backdrop-blur-md">
                  <Icono nombre="play_arrow" relleno className="text-4xl" />
                </span>
              ) : (
                <Spinner tamano={40} colores="border-white/20 border-t-white" />
              )}
            </div>
          )}

          {/* Riel sobre el video (celular): avatar con botón para seguir, como en TikTok, y acciones */}
          <div className="pointer-events-auto absolute right-3 bottom-5 z-20 flex flex-col items-center gap-4 md:hidden">
            <div className="relative">
              <Link to={perfil} aria-label={`Perfil de @${autor.username}`}>
                <Avatar usuario={autor} tamano={44} anillo="insignia" />
              </Link>
              {!video.esMio && (
                <BotonSeguir
                  variante="icono"
                  username={autor.username}
                  siguiendo={video.siguiendoAutor}
                  onCambio={onSeguirAutor}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                />
              )}
            </div>
            <AccionesVideo {...acciones} className="flex gap-3" />
          </div>

          {/* HUD inferior: creador, insignia, descripción, sonido y progreso */}
          <div className="pointer-events-none relative z-10 mt-auto flex flex-col gap-3 p-5 pr-20 md:pr-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Link to={perfil} className="pointer-events-auto relative hidden shrink-0 transition-transform hover:scale-105 md:block">
                  <Avatar usuario={autor} tamano={44} anillo="insignia" />
                  {autor.insignia.nivel && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-lowest">
                      <IconoInsignia nivel={autor.insignia.nivel} tamano={13} apagada={autor.insignia.estado === 'apagada'} />
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={perfil}
                      className="pointer-events-auto truncate font-title-md text-title-md font-bold text-on-surface hover:underline"
                    >
                      @{autor.username}
                    </Link>
                    <InsigniaChip insignia={autor.insignia} />
                  </div>
                  <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                    {autor.nombre} · {formatearNumero(autor.seguidores)} {autor.seguidores === 1 ? 'seguidor' : 'seguidores'}
                  </span>
                </div>
              </div>
              {!video.esMio && (
                <BotonSeguir
                  className="pointer-events-auto hidden md:block"
                  username={autor.username}
                  siguiendo={video.siguiendoAutor}
                  onCambio={onSeguirAutor}
                />
              )}
            </div>

            {video.descripcion && (
              <button
                type="button"
                onClick={() => setDescripcionCompleta((valor) => !valor)}
                className="pointer-events-auto text-left"
                aria-expanded={descripcionCompleta}
              >
                <TextoConHashtags
                  texto={video.descripcion}
                  className={`font-body-md text-body-md leading-snug break-words text-on-surface ${descripcionCompleta ? '' : 'line-clamp-2'}`}
                />
              </button>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex max-w-[220px] min-w-0 items-center gap-2 overflow-hidden md:max-w-[260px]">
                <Icono nombre="music_note" className={`shrink-0 text-base text-primary ${reproduciendo ? 'animate-bounce' : ''}`} />
                <div className="overflow-hidden font-label-md text-label-md whitespace-nowrap text-on-surface-variant">
                  <span className={`inline-flex gap-10 ${reproduciendo ? 'animate-marquee' : ''}`}>
                    <span>{sonido}</span>
                    <span aria-hidden="true">{sonido}</span>
                  </span>
                </div>
              </div>
              <div className="relative flex shrink-0 items-center justify-center">
                <div
                  className={`h-10 w-10 animate-spin rounded-full bg-surface-container-lowest p-1 shadow-lg ring-1 ring-outline-variant/40 [animation-duration:4s] ${
                    reproduciendo ? '' : '[animation-play-state:paused]'
                  }`}
                >
                  <div className="h-full w-full rounded-full bg-gradient-to-tr from-surface-container-high via-surface-container-lowest to-surface-container-high p-1.5">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-secondary p-0.5">
                      <Avatar usuario={autor} tamano={16} />
                    </div>
                  </div>
                </div>
                {reproduciendo && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                  </span>
                )}
              </div>
            </div>

            <div
              role="slider"
              tabIndex={0}
              aria-label="Progreso del video"
              aria-valuemin={0}
              aria-valuemax={Math.round(progreso.total)}
              aria-valuenow={Math.round(progreso.actual)}
              aria-valuetext={`${formatearDuracion(progreso.actual)} de ${formatearDuracion(progreso.total)}`}
              onClick={alHacerClicEnBarra}
              onKeyDown={alPresionarEnBarra}
              className="group/barra pointer-events-auto w-full cursor-pointer pt-2 outline-none"
            >
              <div className="relative h-1 w-full rounded-full bg-surface-container-highest/80 transition-all group-hover/barra:h-2">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary-container"
                  style={{ width: `${porcentaje}%` }}
                >
                  <span className="absolute top-1/2 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_8px_#ffffff] transition-opacity group-hover/barra:opacity-100" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 font-label-sm text-[10px] text-on-surface-variant">
                <span>{formatearDuracion(progreso.actual)}</span>
                <span>{formatearDuracion(progreso.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Riel de acciones a la par del video (escritorio) */}
        <AccionesVideo {...acciones} className="hidden shrink-0 gap-4 pb-6 md:flex" />
      </div>

      <ModalConfirmacion
        abierto={confirmando}
        titulo="¿Eliminar esta proyectada?"
        mensaje="Se borrarán el video, sus me gusta y sus comentarios. Si era parte de tu racha actual, tu progreso de insignia bajará en 1."
        textoConfirmar="Eliminar"
        peligroso
        procesando={eliminando}
        onConfirmar={eliminar}
        onCancelar={() => setConfirmando(false)}
      />
      <ModalReporte
        objetivo={reportando ? { tipo: 'video', id: video.id, titulo: 'Reportar proyectada' } : null}
        onCerrar={() => setReportando(false)}
        onReportado={() => {
          setReportando(false)
          onOcultar?.({ videoId: video.id })
        }}
      />
      <ModalBloqueo
        username={bloqueando ? autor.username : null}
        onCerrar={() => setBloqueando(false)}
        onBloqueado={() => {
          setBloqueando(false)
          onOcultar?.({ autorId: autor.id })
        }}
      />
    </article>
  )
}
