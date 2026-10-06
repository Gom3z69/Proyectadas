import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import PlantillaAcceso from '../components/layout/PlantillaAcceso'
import CampoFormulario from '../components/ui/CampoFormulario'
import Icono from '../components/ui/Icono'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { restablecerPassword } from '../services/authService'

/** Llega desde el enlace del correo (/restablecer?token=...): crea la contraseña nueva e inicia sesión. */
export default function RestablecerPassword() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') ?? ''
  const { abrirSesion } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const enlaceValido = /^[a-f0-9]{64}$/.test(token)

  async function enviar(evento) {
    evento.preventDefault()
    if (password !== confirmacion) return setError('Las contraseñas no coinciden.')
    setError(null)
    setEnviando(true)
    try {
      abrirSesion(await restablecerPassword(token, password))
      toast.exito('Contraseña actualizada', 'Cerramos la sesión en tus otros dispositivos.')
      navigate('/', { replace: true })
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  return (
    <PlantillaAcceso
      titulo="Crea tu contraseña nueva"
      subtitulo="Al guardarla entrarás a tu cuenta y se cerrarán las sesiones en tus otros dispositivos."
      pie={
        <Link to="/login" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
          <Icono nombre="arrow_back" className="text-base" /> Volver a iniciar sesión
        </Link>
      }
    >
      {enlaceValido ? (
        <form onSubmit={enviar} className="space-y-5">
          <CampoFormulario
            etiqueta="Contraseña nueva"
            icono="lock"
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
          />
          <CampoFormulario
            etiqueta="Repite la contraseña"
            icono="lock_reset"
            type="password"
            value={confirmacion}
            onChange={(evento) => setConfirmacion(evento.target.value)}
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
          />
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-2xl bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
              <Icono nombre="error" className="text-lg" />
              <span>
                {error}{' '}
                {/venci|válido/.test(error) && (
                  <Link to="/recuperar" className="font-bold underline">
                    Pedir otro enlace
                  </Link>
                )}
              </span>
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary py-3.5 font-label-lg text-label-lg font-bold text-on-primary shadow-lg shadow-primary-container/40 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
          >
            {enviando ? <Spinner tamano={18} colores="border-on-primary/30 border-t-on-primary" /> : <Icono nombre="key" className="text-xl" />}
            Guardar contraseña
          </button>
        </form>
      ) : (
        <div role="alert" className="space-y-4 rounded-2xl bg-error-container/30 p-5 text-center">
          <Icono nombre="link_off" className="text-4xl text-error" />
          <p className="text-body-md text-on-surface">Este enlace no es válido. Revisa que lo copiaste completo o pide uno nuevo.</p>
          <Link to="/recuperar" className="inline-block font-label-md text-label-md font-bold text-primary hover:underline">
            Pedir otro enlace
          </Link>
        </div>
      )}
    </PlantillaAcceso>
  )
}
