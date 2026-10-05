import { useCallback } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { listarSeguidores, listarSeguidos } from '../../services/usuarioService'
import { rutaPerfil } from '../../utils/enlaces'
import InsigniaChip from '../insignias/InsigniaChip'
import Avatar from '../ui/Avatar'
import BotonSeguir from '../ui/BotonSeguir'
import EstadoVacio from '../ui/EstadoVacio'
import Spinner from '../ui/Spinner'

/** Seguidores o seguidos de un usuario. Vuelve a montarlo con otra key al cambiar de pestaña. */
export default function ListaRelaciones({ username, tipo, onElegir }) {
  const { usuario } = useAuth()
  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = tipo === 'seguidores' ? await listarSeguidores(username, pagina) : await listarSeguidos(username, pagina)
      return { items: datos.usuarios, hayMas: datos.hayMas }
    },
    [username, tipo],
  )
  const { items, hayMas, cargando, error, cargarMas, actualizarItem } = useListaPaginada(cargarPagina)

  if (!cargando && !error && items.length === 0) {
    return (
      <EstadoVacio
        compacto
        icono="group"
        titulo={tipo === 'seguidores' ? 'Sin seguidores todavía' : 'No sigue a nadie todavía'}
      />
    )
  }

  return (
    <ul className="space-y-1">
      {items.map((persona) => (
        <li key={persona.id} className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-surface-container">
          <Link to={rutaPerfil(persona.username, usuario)} onClick={onElegir} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar usuario={persona} tamano={44} anillo="insignia" />
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate font-label-lg text-label-lg text-on-surface">@{persona.username}</span>
                <InsigniaChip insignia={persona.insignia} tamano="sm" />
              </span>
              <span className="block truncate text-body-sm text-on-surface-variant">{persona.nombre}</span>
            </span>
          </Link>
          {!persona.esPropio && (
            <BotonSeguir
              tamano="sm"
              username={persona.username}
              siguiendo={persona.siguiendo}
              onCambio={(resultado) => actualizarItem(persona.id, { siguiendo: resultado.siguiendo })}
            />
          )}
        </li>
      ))}
      {cargando && (
        <li className="flex justify-center py-4">
          <Spinner />
        </li>
      )}
      {error && <li className="py-4 text-center text-body-sm text-error">{error}</li>}
      {!cargando && hayMas && (
        <li>
          <button
            type="button"
            onClick={cargarMas}
            className="w-full rounded-xl py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
          >
            Ver más
          </button>
        </li>
      )}
    </ul>
  )
}
