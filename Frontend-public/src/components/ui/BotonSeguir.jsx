import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { dejarDeSeguir, seguir } from '../../services/usuarioService'
import Icono from './Icono'

const TAMANOS = {
  sm: 'px-3 py-1 text-label-sm',
  md: 'px-4 py-1.5 text-label-md',
  lg: 'px-6 py-2.5 text-label-lg',
}

/**
 * Botón Seguir / Siguiendo. Llama a la API y avisa el resultado con onCambio({ siguiendo, seguidores }).
 * variante "icono": círculo con + / ✓ para ponerlo sobre un avatar (riel del celular).
 * variante "destacado": botón grande con ícono (perfil de otra persona).
 */
export default function BotonSeguir({ username, siguiendo, onCambio, tamano = 'md', variante = 'texto', className = '' }) {
  const [enCurso, setEnCurso] = useState(false)
  const toast = useToast()

  async function alternar(evento) {
    evento.stopPropagation()
    if (enCurso) return
    setEnCurso(true)
    try {
      const resultado = siguiendo ? await dejarDeSeguir(username) : await seguir(username)
      onCambio?.(resultado)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEnCurso(false)
    }
  }

  if (variante === 'icono') {
    return (
      <button
        type="button"
        onClick={alternar}
        disabled={enCurso}
        aria-pressed={siguiendo}
        aria-label={siguiendo ? `Dejar de seguir a @${username}` : `Seguir a @${username}`}
        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-lg ring-2 ring-surface-container-lowest transition-all active:scale-90 disabled:opacity-60 ${
          siguiendo ? 'bg-surface-container-highest text-tertiary' : 'bg-primary text-on-primary'
        } ${className}`}
      >
        <Icono nombre={siguiendo ? 'check' : 'add'} className="text-base font-bold" />
      </button>
    )
  }

  if (variante === 'destacado') {
    return (
      <button
        type="button"
        onClick={alternar}
        disabled={enCurso}
        aria-pressed={siguiendo}
        className={`flex items-center gap-2 rounded-full px-6 py-2.5 font-label-lg text-label-lg font-bold transition-all active:scale-95 disabled:opacity-60 ${
          siguiendo
            ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
            : 'bg-primary-container text-on-primary-container shadow-[0_0_18px_rgba(160,120,255,0.45)] hover:brightness-110'
        } ${className}`}
      >
        <Icono nombre={siguiendo ? 'check' : 'person_add'} className="text-lg" />
        {siguiendo ? 'Siguiendo' : 'Seguir'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={enCurso}
      aria-pressed={siguiendo}
      className={`shrink-0 rounded-full font-label-md font-bold transition-all active:scale-95 disabled:opacity-60 ${TAMANOS[tamano]} ${
        siguiendo
          ? 'bg-surface-container-highest text-on-surface hover:bg-surface-bright'
          : 'bg-primary text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] hover:bg-primary-fixed'
      } ${className}`}
    >
      {siguiendo ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
