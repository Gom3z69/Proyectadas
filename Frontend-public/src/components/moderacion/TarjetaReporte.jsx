import { Link } from 'react-router'
import { tiempoRelativo } from '../../utils/formato'
import { textoMotivo } from '../../utils/reportes'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'
import MiniaturaVideo from '../video/MiniaturaVideo'

const TIPOS = {
  video: { texto: 'Proyectada', icono: 'movie' },
  comentario: { texto: 'Comentario', icono: 'chat_bubble' },
  usuario: { texto: 'Cuenta', icono: 'person' },
}

const RESOLUCIONES = {
  eliminar: 'Contenido eliminado',
  suspender: 'Cuenta suspendida',
  descartar: 'Reporte descartado',
  contenido_eliminado: 'Lo eliminó su autor',
  cuenta_eliminada: 'La cuenta se eliminó',
}

const claseBoton =
  'flex items-center gap-1.5 rounded-full px-4 py-2 font-label-md text-label-md font-semibold transition-colors disabled:opacity-50'

/** Contenido reportado (con todos sus reportes agrupados) y las acciones de moderación. */
export default function TarjetaReporte({ grupo, pendiente, procesando, onAccion }) {
  const { tipo, video, comentario, usuario } = grupo
  const existe = { video, comentario, usuario }[tipo] != null

  return (
    <article className="flex flex-col gap-space-md rounded-xl bg-surface-container p-space-md shadow-lg sm:flex-row">
      <div className="flex shrink-0 justify-center">
        {video ? (
          <Link
            to={`/u/${usuario?.username}?v=${video.id}`}
            aria-label="Ver la proyectada reportada"
            className="block h-36 w-24 overflow-hidden rounded-lg bg-surface-container-highest"
          >
            <MiniaturaVideo video={{ ...video, autor: { username: usuario?.username ?? '' } }} />
          </Link>
        ) : tipo === 'usuario' && usuario ? (
          <Avatar usuario={usuario} tamano={72} />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest text-outline">
            <Icono nombre={TIPOS[tipo].icono} className="text-2xl" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface">
            <Icono nombre={TIPOS[tipo].icono} className="text-xs text-primary" /> {TIPOS[tipo].texto}
          </span>
          {usuario ? (
            <Link to={`/u/${usuario.username}`} className="font-label-md text-label-md font-semibold text-on-surface hover:underline">
              @{usuario.username}
            </Link>
          ) : (
            <span className="font-label-md text-label-md text-outline">Cuenta eliminada</span>
          )}
          {usuario?.suspendida && (
            <span className="rounded-full bg-error/15 px-2 py-0.5 font-label-sm text-label-sm font-bold text-error">Suspendida</span>
          )}
          <span className="font-label-sm text-label-sm text-outline">
            {grupo.total} {grupo.total === 1 ? 'reporte' : 'reportes'} · {tiempoRelativo(grupo.ultimo)}
          </span>
        </div>

        {video && tipo === 'video' && (
          <p className="line-clamp-2 font-body-md text-body-md text-on-surface">{video.descripcion || 'Sin descripción'}</p>
        )}
        {comentario && <p className="font-body-md text-body-md break-words text-on-surface">“{comentario.texto}”</p>}
        {video && tipo === 'comentario' && (
          <p className="line-clamp-1 font-body-sm text-body-sm text-outline">En la proyectada: {video.descripcion || 'sin descripción'}</p>
        )}
        {!existe && <p className="font-body-sm text-body-sm text-outline">El contenido ya no existe.</p>}

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(grupo.motivos).map(([motivo, cantidad]) => (
            <span key={motivo} className="rounded-full bg-error/10 px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              {textoMotivo(motivo)}
              {cantidad > 1 && ` ×${cantidad}`}
            </span>
          ))}
        </div>
        {grupo.detalles.map((detalle, indice) => (
          <p key={indice} className="border-l-2 border-outline-variant pl-3 font-body-sm text-body-sm break-words text-on-surface-variant">
            {detalle}
          </p>
        ))}

        {pendiente ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {tipo !== 'usuario' && existe && (
              <button
                type="button"
                onClick={() => onAccion(grupo, 'eliminar')}
                disabled={procesando}
                className={`${claseBoton} bg-error text-on-error hover:bg-error/90`}
              >
                <Icono nombre="delete" className="text-base" /> Eliminar {tipo === 'video' ? 'proyectada' : 'comentario'}
              </button>
            )}
            {usuario && !usuario.suspendida && (
              <button
                type="button"
                onClick={() => onAccion(grupo, 'suspender')}
                disabled={procesando}
                className={`${claseBoton} bg-error/15 text-error hover:bg-error/25`}
              >
                <Icono nombre="person_off" className="text-base" /> Suspender cuenta
              </button>
            )}
            <button
              type="button"
              onClick={() => onAccion(grupo, 'descartar')}
              disabled={procesando}
              className={`${claseBoton} bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface`}
            >
              <Icono nombre="check" className="text-base" /> Descartar
            </button>
          </div>
        ) : (
          grupo.resolucion && (
            <p className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
              <Icono nombre="task_alt" className="text-base text-tertiary" />
              {RESOLUCIONES[grupo.resolucion.accion] ?? grupo.resolucion.accion} · {tiempoRelativo(grupo.resolucion.fecha)}
            </p>
          )
        )}
      </div>
    </article>
  )
}
