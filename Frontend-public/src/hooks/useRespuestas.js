import { useState } from 'react'
import { listarRespuestas } from '../services/comentarioService'

const HILO_VACIO = { abierto: false, items: [], pagina: 0, hayMas: true, cargando: false, error: null }

// Las respuestas se leen como conversación: de la más antigua a la más reciente, sin repetidas.
function enOrden(actuales, nuevas) {
  const porId = new Map([...actuales, ...nuevas].map((respuesta) => [respuesta.id, respuesta]))
  return [...porId.values()].sort((a, b) => new Date(a.creadoEn) - new Date(b.creadoEn))
}

/**
 * Hilos de respuestas de los comentarios principales, por id del comentario:
 * { abierto, items, pagina, hayMas, cargando, error }. Se cargan por páginas al abrirlos.
 */
export function useRespuestas() {
  const [hilos, setHilos] = useState({})

  function cambiar(id, cambios) {
    setHilos((actuales) => {
      const hilo = actuales[id] ?? HILO_VACIO
      return { ...actuales, [id]: { ...hilo, ...(typeof cambios === 'function' ? cambios(hilo) : cambios) } }
    })
  }

  async function cargarMas(id) {
    const hilo = hilos[id] ?? HILO_VACIO
    if (hilo.cargando) return
    cambiar(id, { abierto: true, cargando: true, error: null })
    try {
      const datos = await listarRespuestas(id, hilo.pagina + 1)
      cambiar(id, (actual) => ({
        items: enOrden(actual.items, datos.respuestas),
        pagina: actual.pagina + 1,
        hayMas: datos.hayMas,
        cargando: false,
      }))
    } catch (error) {
      cambiar(id, { cargando: false, error: error.message })
    }
  }

  function alternar(id) {
    const hilo = hilos[id] ?? HILO_VACIO
    if (hilo.abierto) cambiar(id, { abierto: false })
    else if (hilo.pagina === 0) cargarMas(id)
    else cambiar(id, { abierto: true })
  }

  return {
    hilo: (id) => hilos[id] ?? HILO_VACIO,
    alternar,
    cargarMas,
    /** Muestra una respuesta recién publicada en su hilo (y lo abre). */
    agregar: (id, respuesta) => cambiar(id, (hilo) => ({ abierto: true, items: enOrden(hilo.items, [respuesta]) })),
    quitar: (id, idRespuesta) => cambiar(id, (hilo) => ({ items: hilo.items.filter((r) => r.id !== idRespuesta) })),
    actualizar: (id, idRespuesta, cambios) =>
      cambiar(id, (hilo) => ({
        items: hilo.items.map((respuesta) => (respuesta.id === idRespuesta ? { ...respuesta, ...cambios } : respuesta)),
      })),
  }
}
