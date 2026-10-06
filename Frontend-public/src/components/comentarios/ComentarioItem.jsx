import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useMeGustaComentario } from '../../hooks/useInteraccion'
import { rutaPerfil } from '../../utils/enlaces'
import { formatearNumero, tiempoRelativo } from '../../utils/formato'
import { degradadoInsignia } from '../../utils/insignias'
import InsigniaChip from '../insignias/InsigniaChip'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'

// "@usuario" al inicio o tras un espacio; no termina en punto para no tomar el de la oración.
const MENCION = /((?<=^|\s)@[a-z0-9._]{2,23}[a-z0-9_])/i

/** Texto del comentario con las @menciones enlazadas al perfil. */
function TextoComentario({ texto, usuario }) {
  const partes = texto.split(MENCION)
  return (
    <p className="mt-1 font-body-md text-body-md break-words whitespace-pre-line text-on-surface">
      {partes.map((parte, indice) =>
        indice % 2 === 1 ? (
          <Link
            key={indice}
            to={rutaPerfil(parte.slice(1).toLowerCase(), usuario)}
            className="font-semibold text-primary hover:underline"
          >
            {parte}
          </Link>
        ) : (
          parte
        ),
      )}
    </p>
  )
}

/**
 * Comentario o respuesta: autor con su insignia, me gusta, "Responder" y eliminar.
 * En un comentario principal, `children` es su hilo de respuestas.
 */
export default function ComentarioItem({
  comentario,
  esDelCreador,
  esRespuesta = false,
  onActualizar,
  onResponder,
  onEliminar,
  onReportar,
  children,
}) {
  const { usuario } = useAuth()
  const alternarMeGusta = useMeGustaComentario(comentario, onActualizar)
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const { autor } = comentario
  const acento = !esRespuesta && autor.insignia.estado !== 'apagada' && degradadoInsignia(autor.insignia.nivel, '180deg')
  const perfil = rutaPerfil(autor.username, usuario)
  const esMio = autor.id === usuario.id

  async function eliminar() {
    setEliminando(true)
    await onEliminar(comentario)
    setEliminando(false)
  }

  const contenido = (
    <div className={`flex items-start ${esRespuesta ? 'gap-2.5' : 'gap-3 pl-1'}`}>
      <Link to={perfil} className="shrink-0" aria-label={`Perfil de @${autor.username}`}>
        <Avatar usuario={autor} tamano={esRespuesta ? 24 : 32} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Link to={perfil} className="truncate font-label-md text-label-md font-bold text-on-surface hover:underline">
              @{autor.username}
            </Link>
            <InsigniaChip insignia={autor.insignia} tamano="sm" />
          </div>
          <span className="shrink-0 font-label-sm text-label-sm text-outline">{tiempoRelativo(comentario.creadoEn)}</span>
        </div>
        <TextoComentario texto={comentario.texto} usuario={usuario} />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-label-sm text-label-sm text-on-surface-variant">
          <button
            type="button"
            onClick={() => alternarMeGusta()}
            aria-pressed={comentario.meGusta}
            aria-label={comentario.meGusta ? 'Quitar me gusta al comentario' : 'Me gusta el comentario'}
            className={`flex items-center gap-1 transition-colors ${comentario.meGusta ? 'text-error' : 'hover:text-error'}`}
          >
            <Icono nombre="favorite" relleno={comentario.meGusta} className="text-sm" />
            <span className="tabular-nums">{formatearNumero(comentario.likesCount)}</span>
          </button>
          <button type="button" onClick={() => onResponder(comentario)} className="transition-colors hover:text-primary">
            Responder
          </button>
          {esDelCreador && (
            <span className="flex items-center gap-1 text-primary">
              <Icono nombre="verified" relleno className="text-sm" /> Creador
            </span>
          )}
          {!esMio && onReportar && (
            <button
              type="button"
              onClick={() => onReportar(comentario)}
              className="flex items-center gap-1 transition-colors hover:text-error"
            >
              <Icono nombre="flag" className="text-sm" /> Reportar
            </button>
          )}
          {comentario.puedeEliminar &&
            (confirmando ? (
              <span className="flex items-center gap-3">
                <span>¿Eliminar{!esRespuesta && comentario.respuestasCount > 0 ? ' con sus respuestas' : ''}?</span>
                <button type="button" onClick={eliminar} disabled={eliminando} className="font-bold text-error hover:underline">
                  {eliminando ? 'Eliminando...' : 'Sí'}
                </button>
                <button type="button" onClick={() => setConfirmando(false)} className="hover:text-on-surface">
                  No
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                className="flex items-center gap-1 transition-colors hover:text-error"
              >
                <Icono nombre="delete" className="text-sm" /> Eliminar
              </button>
            ))}
        </div>
        {children}
      </div>
    </div>
  )

  if (esRespuesta) return <article>{contenido}</article>

  return (
    <article className="relative overflow-hidden rounded-2xl bg-surface-container p-3.5 shadow-sm transition-colors hover:bg-surface-container-high">
      <span
        className="absolute inset-y-0 left-0 w-1 bg-outline-variant/60"
        style={acento ? { background: acento } : undefined}
        aria-hidden="true"
      />
      {contenido}
    </article>
  )
}
