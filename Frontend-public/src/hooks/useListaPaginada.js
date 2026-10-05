import { useCallback, useEffect, useRef, useState } from 'react'

function unirSinRepetidos(actuales, nuevos) {
  const vistos = new Set(actuales.map((item) => item.id))
  return [...actuales, ...nuevos.filter((item) => !vistos.has(item.id))]
}

/**
 * Lista con paginación incremental ("cargar más" / scroll infinito).
 * `cargarPagina(pagina)` debe devolver { items, hayMas } y ser estable (useCallback).
 * Para cambiar de fuente (otro usuario, otro feed), vuelve a montar el componente con otra `key`.
 */
export function useListaPaginada(cargarPagina) {
  const [estado, setEstado] = useState({ items: [], hayMas: true, cargando: true, error: null })
  const control = useRef({ pagina: 0, enCurso: false })

  const cargarMas = useCallback(async () => {
    const actual = control.current
    if (actual.enCurso) return
    actual.enCurso = true
    setEstado((previo) => ({ ...previo, cargando: true, error: null }))
    try {
      const { items, hayMas } = await cargarPagina(actual.pagina + 1)
      actual.pagina += 1
      setEstado((previo) => ({ items: unirSinRepetidos(previo.items, items), hayMas, cargando: false, error: null }))
    } catch (error) {
      setEstado((previo) => ({ ...previo, cargando: false, error: error.message }))
    } finally {
      actual.enCurso = false
    }
  }, [cargarPagina])

  useEffect(() => {
    cargarMas()
  }, [cargarMas])

  const actualizarItem = useCallback((id, cambios) => {
    setEstado((previo) => ({
      ...previo,
      items: previo.items.map((item) =>
        item.id === id ? { ...item, ...(typeof cambios === 'function' ? cambios(item) : cambios) } : item,
      ),
    }))
  }, [])

  /** Aplica `cambios` a todos los items que cumplan `condicion` (p. ej. todos los videos de un autor). */
  const actualizarDonde = useCallback((condicion, cambios) => {
    setEstado((previo) => ({
      ...previo,
      items: previo.items.map((item) =>
        condicion(item) ? { ...item, ...(typeof cambios === 'function' ? cambios(item) : cambios) } : item,
      ),
    }))
  }, [])

  const quitarItem = useCallback((id) => {
    setEstado((previo) => ({ ...previo, items: previo.items.filter((item) => item.id !== id) }))
  }, [])

  const agregarAlInicio = useCallback((item) => {
    setEstado((previo) => ({ ...previo, items: [item, ...previo.items.filter((i) => i.id !== item.id)] }))
  }, [])

  return { ...estado, cargarMas, actualizarItem, actualizarDonde, quitarItem, agregarAlInicio }
}
