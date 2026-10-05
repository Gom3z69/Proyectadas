import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useClicFuera } from '../../hooks/useClicFuera'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { useNoLeidas } from '../../hooks/useNoLeidas'
import { marcarLeidas, obtenerNotificaciones } from '../../services/notificacionService'
import { rutaPerfil } from '../../utils/enlaces'
import { formatearHora, formatearRestante, tiempoRelativo } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import Avatar from '../ui/Avatar'
import EstadoVacio from '../ui/EstadoVacio'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'
import MiniaturaVideo from '../video/MiniaturaVideo'

const ACCIONES = {
  seguidor: 'empezó a seguirte',
  like: 'le dio me gusta a tu proyectada',
  comentario: 'comentó tu proyectada',
  respuesta: 'respondió a tu comentario',
  like_comentario: 'le dio me gusta a tu comentario',
}

/** Texto de un aviso de racha según si el plazo sigue vigente. */
function textoRacha(notificacion, ahora) {
  const insignia = ESTILOS_INSIGNIA[notificacion.nivel]?.nombre ?? ''
  const restante = new Date(notificacion.venceEn).getTime() - ahora
  if (notificacion.tipo === 'racha_por_vencer') {
    return restante > 0
      ? `Tu racha vence en ${formatearRestante(restante)}: publica una proyectada para conservar tu insignia ${insignia}.`
      : `Tu racha venció el ${formatearHora(notificacion.venceEn)}.`
  }
  return restante > 0
    ? `Tu insignia ${insignia} se apagó. Revívela antes del ${formatearHora(notificacion.venceEn)} usando una vida.`
    : `Tu insignia ${insignia} se apagó y el plazo para revivirla terminó.`
}

/** A dónde lleva cada notificación al tocarla. */
function destino(notificacion, usuario) {
  if (notificacion.tipo.startsWith('racha')) return '/mis-proyectadas'
  if (notificacion.tipo === 'seguidor') return rutaPerfil(notificacion.actor.username, usuario)
  return `${rutaPerfil(notificacion.video.autor.username, usuario)}?v=${notificacion.video.id}`
}

function ItemNotificacion({ notificacion, ahora, onElegir }) {
  const { tipo, actor, video, comentario } = notificacion
  const esRacha = tipo.startsWith('racha')
  const apagada = tipo === 'racha_apagada'

  return (
    <li>
      <button
        type="button"
        onClick={() => onElegir(notificacion)}
        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-container-highest ${
          notificacion.leida ? '' : 'bg-primary-container/10'
        }`}
      >
        {esRacha ? (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              apagada ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary'
            }`}
          >
            <Icono nombre={apagada ? 'local_fire_department' : 'timer'} relleno className="text-xl" />
          </span>
        ) : (
          <Avatar usuario={actor} tamano={36} />
        )}

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-body-sm text-body-sm text-on-surface">
            {esRacha ? (
              textoRacha(notificacion, ahora)
            ) : (
              <>
                <strong className="font-semibold">@{actor.username}</strong> {ACCIONES[tipo]}
              </>
            )}
          </span>
          {comentario && (
            <span className="line-clamp-2 font-body-sm text-body-sm break-words text-on-surface-variant">
              “{comentario.texto}”
            </span>
          )}
          <span className="font-label-sm text-label-sm text-outline">{tiempoRelativo(notificacion.creadoEn)}</span>
        </span>

        {video && (
          <span className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container-highest">
            <MiniaturaVideo video={video} />
          </span>
        )}
        {!notificacion.leida && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary shadow-[0_0_6px_#4cd7f6]" aria-label="Nueva" />
        )}
      </button>
    </li>
  )
}

/** Lista de notificaciones. Al abrirse marca como leídas las que muestra (siguen resaltadas mientras está abierta). */
function PanelNotificaciones({ onCerrar, onNoLeidas }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [ahora] = useState(() => Date.now())

  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = await obtenerNotificaciones(pagina)
      if (pagina === 1 && datos.noLeidas > 0) {
        marcarLeidas(datos.notificaciones[0]?.creadoEn)
          .then((respuesta) => onNoLeidas(respuesta.noLeidas))
          .catch(() => {})
      }
      return { items: datos.notificaciones, hayMas: datos.hayMas }
    },
    [onNoLeidas],
  )
  const lista = useListaPaginada(cargarPagina)
  const nuevas = lista.items.filter((notificacion) => !notificacion.leida).length

  const cerrarConEscape = useEffectEvent((evento) => {
    if (evento.key === 'Escape') onCerrar()
  })
  useEffect(() => {
    const manejar = (evento) => cerrarConEscape(evento)
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [])

  function elegir(notificacion) {
    onCerrar()
    navigate(destino(notificacion, usuario))
  }

  return (
    <div
      role="dialog"
      aria-label="Notificaciones"
      className="fixed inset-x-3 top-[76px] z-50 flex max-h-[min(72dvh,560px)] animate-aparecer flex-col rounded-2xl bg-surface-container-high shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40 md:absolute md:inset-x-auto md:top-full md:right-0 md:mt-3 md:w-[400px]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 pb-2">
        <h2 className="font-title-md text-title-md font-bold text-on-surface">Notificaciones</h2>
        {nuevas > 0 && (
          <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-secondary">
            {nuevas} {nuevas === 1 ? 'nueva' : 'nuevas'}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ul className="flex flex-col gap-0.5">
          {lista.items.map((notificacion) => (
            <ItemNotificacion key={notificacion.id} notificacion={notificacion} ahora={ahora} onElegir={elegir} />
          ))}
        </ul>

        {lista.cargando && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {!lista.cargando && lista.error && (
          <p className="py-6 text-center text-body-sm text-error">
            {lista.error}{' '}
            <button type="button" onClick={lista.cargarMas} className="font-bold underline">
              Reintentar
            </button>
          </p>
        )}
        {!lista.cargando && !lista.error && lista.items.length === 0 && (
          <EstadoVacio
            compacto
            icono="notifications_off"
            titulo="Aún no tienes notificaciones"
            mensaje="Aquí verás nuevos seguidores, me gusta, comentarios y los avisos de tu racha."
          />
        )}
        {!lista.cargando && lista.hayMas && lista.items.length > 0 && (
          <button
            type="button"
            onClick={lista.cargarMas}
            className="mt-1 w-full rounded-xl py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-highest"
          >
            Ver anteriores
          </button>
        )}
      </div>
    </div>
  )
}

/** Campana del encabezado (diseño de STITCH): punto cian cuando hay notificaciones sin leer. */
export default function Notificaciones() {
  const [noLeidas, setNoLeidas] = useNoLeidas()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)

  useClicFuera(contenedor, () => setAbierto(false), abierto)

  return (
    <div ref={contenedor} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={noLeidas > 0 ? `Notificaciones (${noLeidas} sin leer)` : 'Notificaciones'}
        className={`relative flex items-center justify-center rounded-full p-2 transition-all hover:bg-surface-container hover:text-on-surface ${
          abierto ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant'
        }`}
      >
        <Icono nombre="notifications" relleno={abierto} className="text-xl" />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
        )}
      </button>
      {abierto && <PanelNotificaciones onCerrar={() => setAbierto(false)} onNoLeidas={setNoLeidas} />}
    </div>
  )
}
