import { useListaPaginada } from '../../hooks/useListaPaginada'
import VideosPerfil from './VideosPerfil'

/**
 * Carga una lista paginada con `cargarPagina(pagina)` → { items, hayMas } y la muestra.
 * Vuelve a montarlo con otra `key` al cambiar de pestaña u orden.
 */
export default function ListaVideos({ cargarPagina, ...props }) {
  const lista = useListaPaginada(cargarPagina)
  return <VideosPerfil lista={lista} {...props} />
}
