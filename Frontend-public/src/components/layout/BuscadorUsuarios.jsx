import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useClicFuera } from '../../hooks/useClicFuera'
import { useRetraso } from '../../hooks/useRetraso'
import { buscarUsuarios } from '../../services/usuarioService'
import { rutaPerfil } from '../../utils/enlaces'
import InsigniaChip from '../insignias/InsigniaChip'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

/** Busca creadores por nombre o @usuario y lleva a su perfil. */
export default function BuscadorUsuarios({ autoFocus = false, onElegir, className = '' }) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState({ consulta: '', usuarios: [] })
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(-1)
  const consulta = useRetraso(texto.trim(), 250)
  const contenedor = useRef(null)
  const navigate = useNavigate()
  const { usuario } = useAuth()

  useClicFuera(contenedor, () => setAbierto(false), abierto)

  useEffect(() => {
    if (!consulta) return
    const control = new AbortController()
    buscarUsuarios(consulta, control.signal)
      .then((datos) => {
        setResultados({ consulta, usuarios: datos.usuarios })
        setResaltado(-1)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setResultados({ consulta, usuarios: [] })
      })
    return () => control.abort()
  }, [consulta])

  const termino = texto.trim()
  const buscando = Boolean(termino) && resultados.consulta !== termino
  const usuarios = termino ? resultados.usuarios : []

  function elegir(elegido) {
    navigate(rutaPerfil(elegido.username, usuario))
    setTexto('')
    setAbierto(false)
    onElegir?.()
  }

  function alPresionarTecla(evento) {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setResaltado((indice) => Math.min(usuarios.length - 1, indice + 1))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setResaltado((indice) => Math.max(-1, indice - 1))
    } else if (evento.key === 'Enter' && usuarios.length > 0) {
      evento.preventDefault()
      elegir(usuarios[Math.max(0, resaltado)])
    } else if (evento.key === 'Escape') {
      setAbierto(false)
    }
  }

  return (
    <div ref={contenedor} className={`group relative w-full ${className}`}>
      <Icono
        nombre="search"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-on-surface-variant transition-colors group-focus-within:text-primary"
      />
      <input
        type="search"
        value={texto}
        autoFocus={autoFocus}
        onChange={(evento) => {
          setTexto(evento.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={alPresionarTecla}
        placeholder="Buscar creadores por nombre o @usuario..."
        aria-label="Buscar creadores"
        role="combobox"
        aria-expanded={abierto && Boolean(termino)}
        aria-controls="resultados-busqueda"
        className="w-full rounded-full bg-surface-container-low py-2.5 pr-4 pl-11 font-body-md text-body-md text-on-surface shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-all placeholder:text-outline focus:bg-surface-container focus:ring-1 focus:ring-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />

      {abierto && termino && (
        <div
          id="resultados-busqueda"
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 animate-aparecer overflow-hidden rounded-2xl bg-surface-container-high p-1.5 shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40"
        >
          {buscando && (
            <div className="flex items-center gap-3 px-3 py-3 text-body-sm text-on-surface-variant">
              <Spinner tamano={16} /> Buscando creadores...
            </div>
          )}
          {!buscando && usuarios.length === 0 && (
            <p className="px-3 py-3 text-body-sm text-on-surface-variant">Sin resultados para “{termino}”.</p>
          )}
          {!buscando &&
            usuarios.map((encontrado, indice) => (
              <button
                key={encontrado.id}
                type="button"
                role="option"
                aria-selected={indice === resaltado}
                onMouseEnter={() => setResaltado(indice)}
                onClick={() => elegir(encontrado)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  indice === resaltado ? 'bg-surface-container-highest' : 'hover:bg-surface-container-highest'
                }`}
              >
                <Avatar usuario={encontrado} tamano={36} anillo="insignia" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-label-lg text-label-lg text-on-surface">@{encontrado.username}</span>
                    <InsigniaChip insignia={encontrado.insignia} tamano="sm" />
                  </span>
                  <span className="block truncate text-body-sm text-on-surface-variant">{encontrado.nombre}</span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
