import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import PanelPublicacion from '../components/subida/PanelPublicacion'
import TarjetaInsignia from '../components/subida/TarjetaInsignia'
import TarjetaRacha from '../components/subida/TarjetaRacha'
import ZonaSubida from '../components/subida/ZonaSubida'
import Icono from '../components/ui/Icono'
import ListaVideos from '../components/video/ListaVideos'
import { useAuth } from '../hooks/useAuth'
import { useSubidaProyectada } from '../hooks/useSubidaProyectada'
import { useToast } from '../hooks/useToast'
import { revivirInsignia } from '../services/insigniaService'
import { obtenerMisVideos } from '../services/usuarioService'
import { obtenerVideo } from '../services/videoService'
import { ESTILOS_INSIGNIA } from '../utils/insignias'

const FILTROS = [
  { clave: 'todas', texto: 'Todas' },
  { clave: 'publicadas', texto: 'Publicadas' },
  { clave: 'borradores', texto: 'Borradores' },
]

const VACIOS = {
  todas: { icono: 'movie', titulo: 'Todavía no subes nada', mensaje: 'Tu primera proyectada te da la insignia Bronce.' },
  publicadas: { icono: 'movie', titulo: 'Todavía no publicas nada', mensaje: 'Tu primera proyectada te da la insignia Bronce.' },
  borradores: {
    icono: 'draft',
    titulo: 'No tienes borradores',
    mensaje: 'Usa "Guardar como Borrador" para terminar una proyectada después. Los borradores no cuentan para tu racha.',
  },
}

/** Mis Proyectadas (diseño de STITCH): subir videos, ver la racha y administrar borradores y publicadas. */
export default function MisProyectadas() {
  const { usuario, actualizarUsuario, refrescarUsuario } = useAuth()
  const toast = useToast()
  const [parametros, setParametros] = useSearchParams()
  const entradaVideo = useRef(null)
  const entradaPortada = useRef(null)
  const panel = useRef(null)
  const [filtro, setFiltro] = useState('todas')
  const [version, setVersion] = useState(0) // Cambia para recargar la lista tras publicar o guardar.
  const [conteo, setConteo] = useState(null) // { publicadas, borradores }
  const [reviviendo, setReviviendo] = useState(false)

  const cargarVideos = useCallback(
    async (pagina) => {
      const datos = await obtenerMisVideos(pagina, { limite: 8, estado: filtro })
      setConteo(datos.conteo)
      return { items: datos.videos, hayMas: datos.hayMas }
    },
    [filtro],
  )
  const subida = useSubidaProyectada({ onPublicado: alPublicar, onBorradorGuardado: alGuardarBorrador })
  const abrirSelectorVideo = () => entradaVideo.current?.click()
  const abrirSelectorPortada = () => entradaPortada.current?.click()
  const recargarLista = () => setVersion((actual) => actual + 1)

  function alPublicar({ insignia, evento }) {
    recargarLista()
    actualizarUsuario({ insignia })
    if (evento.nuevoNivel) {
      const nombre = ESTILOS_INSIGNIA[evento.nuevoNivel]?.nombre
      toast.insignia(evento.nuevoNivel, `¡Nueva insignia: ${nombre}!`, 'Sigue publicando cada día para subir de nivel.')
    } else if (evento.revivida) {
      toast.insignia(insignia.nivel, '¡Tu insignia revivió!', `Usaste 1 vida; te quedan ${insignia.oportunidades} este mes.`)
    } else {
      // Con la insignia permanente (cuenta administradora) no hay racha que mencionar.
      toast.exito('¡Proyectada publicada!', insignia.permanente ? 'Ya aparece en el feed.' : 'Ya aparece en el feed. Tu racha sigue encendida.')
    }
  }

  function alGuardarBorrador() {
    recargarLista()
    toast.exito('Borrador guardado', 'Está en "Borradores": publícalo cuando quieras. Aún no cuenta para tu racha.')
  }

  function alEliminar(respuesta, id) {
    const clave = respuesta.estado === 'borrador' ? 'borradores' : 'publicadas'
    setConteo((actual) => actual && { ...actual, [clave]: Math.max(0, actual[clave] - 1) })
    actualizarUsuario({ insignia: respuesta.insignia })
    if (subida.borrador?.id === id) subida.descartar()
  }

  function continuarBorrador(video) {
    if (subida.subiendo) return toast.info('Espera a que termine el envío actual.')
    subida.continuarBorrador(video)
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // "Continuar edición" desde el perfil llega como /mis-proyectadas?borrador=<id>.
  const borradorPendiente = parametros.get('borrador')
  const abrirBorradorPendiente = useEffectEvent(({ video, error }) => {
    setParametros({}, { replace: true })
    if (error) toast.error('Ese borrador ya no existe.')
    else if (video.estado !== 'borrador') toast.info('Esa proyectada ya está publicada.')
    else continuarBorrador(video)
  })

  useEffect(() => {
    if (!borradorPendiente) return
    let vigente = true
    obtenerVideo(borradorPendiente)
      .then(({ video }) => vigente && abrirBorradorPendiente({ video }))
      .catch(() => vigente && abrirBorradorPendiente({ error: true }))
    return () => {
      vigente = false
    }
  }, [borradorPendiente])

  async function revivir() {
    setReviviendo(true)
    try {
      const { insignia } = await revivirInsignia()
      actualizarUsuario({ insignia })
      toast.insignia(insignia.nivel, '¡Insignia revivida!', `Te quedan ${insignia.oportunidades} vidas este mes.`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setReviviendo(false)
    }
  }

  const { insignia } = usuario
  const nivel = ESTILOS_INSIGNIA[insignia.nivel]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-xl px-space-md py-space-lg lg:px-margin">
      <div className="relative flex flex-col items-start justify-between gap-space-md pb-space-sm md:flex-row md:items-end">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]" />
            <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
              Estudio de creación • {nivel ? `Nivel ${nivel.nombre}` : 'Sin insignia'}
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-xl md:text-headline-xl">
            Mis Proyectadas
          </h1>
          <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Sube tus videos, elige su portada y publícalos para mantener viva tu racha, o guárdalos como borrador para
            terminarlos después.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm self-stretch md:self-auto">
          <button
            type="button"
            onClick={abrirSelectorVideo}
            disabled={subida.subiendo}
            className="flex flex-1 items-center justify-center gap-space-xs rounded-full bg-gradient-to-r from-primary-container via-inverse-primary to-secondary px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary-fixed shadow-[0_0_24px_rgba(160,120,255,0.45)] transition-all hover:shadow-[0_0_32px_rgba(160,120,255,0.7)] disabled:opacity-60 md:flex-none"
          >
            <Icono nombre="cloud_upload" className="text-lg" /> Subir Proyectada
          </button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-4">
          <ZonaSubida onAbrir={abrirSelectorVideo} onSoltar={subida.elegir} deshabilitada={subida.subiendo} />
          <TarjetaRacha
            insignia={insignia}
            onRevivir={revivir}
            reviviendo={reviviendo}
            onVencido={() => refrescarUsuario().catch(() => {})}
          />
          <TarjetaInsignia insignia={insignia} />
        </div>
        <PanelPublicacion
          ref={panel}
          subida={subida}
          usuario={usuario}
          onCambiarPortada={abrirSelectorPortada}
          className="lg:col-span-8"
        />
      </div>

      <section className="flex w-full flex-col gap-space-md pt-space-md" aria-labelledby="titulo-recientes">
        <div className="flex flex-col items-start justify-between gap-space-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-space-xs">
            <Icono nombre="video_library" className="text-2xl text-primary" />
            <h2
              id="titulo-recientes"
              className="min-w-0 font-headline-sm text-headline-sm text-on-surface md:font-headline-md md:text-headline-md"
            >
              Tus borradores y Proyectadas recientes
            </h2>
            {conteo && (
              <span className="ml-space-xs shrink-0 rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm font-bold whitespace-nowrap text-on-surface-variant">
                {conteo.publicadas + conteo.borradores} Total
              </span>
            )}
          </div>
          <div className="flex items-center gap-space-xs self-stretch sm:self-auto" role="tablist" aria-label="Filtrar mis proyectadas">
            {FILTROS.map((opcion) => {
              const activo = opcion.clave === filtro
              const cantidad = conteo?.[opcion.clave]
              return (
                <button
                  key={opcion.clave}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setFiltro(opcion.clave)}
                  className={`rounded-full px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                    activo
                      ? 'bg-surface-container-high font-bold text-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {opcion.texto}
                  {cantidad != null && ` (${cantidad})`}
                </button>
              )
            })}
          </div>
        </div>
        <ListaVideos
          key={`${filtro}-${version}`}
          cargarPagina={cargarVideos}
          variante="estudio"
          permitirEliminar
          insigniaPropia={{ nivel: insignia.nivel, estado: insignia.estado }}
          onEditarBorrador={continuarBorrador}
          onVideoEliminado={alEliminar}
          vacio={VACIOS[filtro]}
        />
      </section>

      {/* Selectores ocultos: abren la galería en el celular o el explorador de archivos en la compu. */}
      <input
        ref={entradaVideo}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(evento) => {
          subida.elegir(evento.target.files?.[0])
          evento.target.value = ''
        }}
      />
      <input
        ref={entradaPortada}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(evento) => {
          subida.elegirPortadaPersonal(evento.target.files?.[0])
          evento.target.value = ''
        }}
      />
    </div>
  )
}
