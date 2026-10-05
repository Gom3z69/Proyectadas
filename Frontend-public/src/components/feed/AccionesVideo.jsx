import { formatearNumero } from '../../utils/formato'
import Icono from '../ui/Icono'

function Accion({ etiqueta, conteo, onClick, children, pulso, presionado }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={etiqueta}
        aria-pressed={presionado}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high/80 text-on-surface shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-surface-container-highest active:scale-110"
      >
        {children}
        <span
          className={`pointer-events-none absolute inset-0 scale-0 rounded-full blur-sm transition-transform group-hover:scale-100 ${pulso}`}
        />
      </button>
      <span className="font-label-sm text-label-sm font-bold tracking-tight text-on-surface [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
        {conteo}
      </span>
    </div>
  )
}

/**
 * Riel vertical de acciones (me gusta, comentarios, guardar, compartir) a la par del video.
 * `className` debe incluir el display y la separación (p. ej. "flex gap-4" o "hidden gap-4 md:flex").
 */
export default function AccionesVideo({ video, onMeGusta, onComentarios, onGuardar, onCompartir, className = 'flex gap-4' }) {
  return (
    <div className={`flex-col items-center ${className}`}>
      <Accion
        etiqueta={video.meGusta ? 'Quitar me gusta' : 'Dar me gusta'}
        presionado={video.meGusta}
        conteo={formatearNumero(video.likesCount)}
        onClick={() => onMeGusta()}
        pulso="bg-error/20"
      >
        <Icono
          key={video.meGusta ? 'si' : 'no'}
          nombre="favorite"
          relleno={video.meGusta}
          className={`text-2xl transition-colors duration-200 group-hover:text-error ${video.meGusta ? 'animate-latido text-error' : ''}`}
        />
      </Accion>
      <Accion etiqueta="Abrir comentarios" conteo={formatearNumero(video.comentariosCount)} onClick={onComentarios} pulso="bg-primary/20">
        <Icono nombre="mode_comment" className="text-2xl transition-colors group-hover:text-primary" />
      </Accion>
      <Accion
        etiqueta={video.guardado ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        presionado={video.guardado}
        conteo={formatearNumero(video.guardadosCount)}
        onClick={() => onGuardar()}
        pulso="bg-secondary/20"
      >
        <Icono
          key={video.guardado ? 'si' : 'no'}
          nombre="bookmark"
          relleno={video.guardado}
          className={`text-2xl transition-colors duration-200 group-hover:text-secondary ${video.guardado ? 'animate-latido text-secondary' : ''}`}
        />
      </Accion>
      <Accion etiqueta="Compartir proyectada" conteo="Compartir" onClick={onCompartir} pulso="bg-tertiary/20">
        <Icono nombre="share" className="text-2xl transition-colors group-hover:text-tertiary" />
      </Accion>
    </div>
  )
}
