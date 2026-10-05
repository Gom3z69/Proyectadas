import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { borrarToken, EVENTO_SESION_EXPIRADA, guardarToken, leerToken } from '../utils/sesion'
import { AuthContext } from './contextos'

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Si hay token guardado, se valida con el backend antes de mostrar las páginas privadas.
  const [verificando, setVerificando] = useState(() => Boolean(leerToken()))

  useEffect(() => {
    if (!leerToken()) return
    authService
      .obtenerSesion()
      .then((datos) => setUsuario(datos.usuario))
      .catch(() => borrarToken())
      .finally(() => setVerificando(false))
  }, [])

  useEffect(() => {
    const alExpirar = () => {
      borrarToken()
      setUsuario(null)
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [])

  const abrirSesion = useCallback(({ token, usuario: datosUsuario }) => {
    guardarToken(token)
    setUsuario(datosUsuario)
    return datosUsuario
  }, [])

  const iniciarSesion = useCallback(
    async (identificador, password) => abrirSesion(await authService.iniciarSesion(identificador, password)),
    [abrirSesion],
  )

  const registrarse = useCallback(
    async (datos) => abrirSesion(await authService.registrar(datos)),
    [abrirSesion],
  )

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  /** Vuelve a pedir la sesión (p. ej. cuando vence el plazo de la racha). */
  const refrescarUsuario = useCallback(async () => {
    const datos = await authService.obtenerSesion()
    setUsuario(datos.usuario)
    return datos.usuario
  }, [])

  /** Aplica cambios locales sin ir al servidor (insignia tras publicar, perfil editado...). */
  const actualizarUsuario = useCallback((cambios) => {
    setUsuario((actual) => (actual ? { ...actual, ...cambios } : actual))
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      verificando,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      refrescarUsuario,
      actualizarUsuario,
    }),
    [usuario, verificando, iniciarSesion, registrarse, cerrarSesion, refrescarUsuario, actualizarUsuario],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
