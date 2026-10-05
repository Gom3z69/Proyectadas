import { useCallback, useEffect, useState } from 'react'
import { obtenerPerfil } from '../services/usuarioService'
import { useAuth } from './useAuth'

/**
 * Perfil completo de `username` (estadísticas, insignia, portada...).
 * Vuelve a montar el componente con otra `key` al cambiar de usuario.
 */
export function usePerfil(username) {
  const { actualizarUsuario } = useAuth()
  const [estado, setEstado] = useState({ perfil: null, cargando: true, error: null })
  const [recargas, setRecargas] = useState(0)

  useEffect(() => {
    let vigente = true
    obtenerPerfil(username)
      .then(({ usuario: perfil }) => {
        if (!vigente) return
        setEstado({ perfil, cargando: false, error: null })
        // Mantiene sincronizada la insignia del encabezado y del feed.
        if (perfil.esPropio) actualizarUsuario({ insignia: perfil.insignia })
      })
      .catch((error) => vigente && setEstado({ perfil: null, cargando: false, error }))
    return () => {
      vigente = false
    }
  }, [username, recargas, actualizarUsuario])

  /** Vuelve a pedir el perfil (al vencer un plazo de la racha o tras eliminar un video). */
  const recargar = useCallback(() => setRecargas((total) => total + 1), [])

  /** Aplica cambios locales al perfil (seguir, editar, revivir...). Acepta un objeto o una función. */
  const actualizar = useCallback((cambios) => {
    setEstado((previo) => {
      if (!previo.perfil) return previo
      const nuevos = typeof cambios === 'function' ? cambios(previo.perfil) : cambios
      return { ...previo, perfil: { ...previo.perfil, ...nuevos } }
    })
  }, [])

  return { ...estado, recargar, actualizar }
}
