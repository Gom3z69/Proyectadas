import { useState } from 'react'
import { Link } from 'react-router'
import PlantillaAcceso from '../components/layout/PlantillaAcceso'
import CampoFormulario from '../components/ui/CampoFormulario'
import Icono from '../components/ui/Icono'
import Spinner from '../components/ui/Spinner'
import { solicitarRecuperacion } from '../services/authService'

/** "¿Olvidaste tu contraseña?": envía al correo un enlace para crear una nueva. */
export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const respuesta = await solicitarRecuperacion(email.trim())
      setMensaje(respuesta.mensaje)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PlantillaAcceso
      titulo="Recupera tu cuenta"
      subtitulo="Te enviaremos un enlace para crear una contraseña nueva."
      pie={
        <Link to="/login" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
          <Icono nombre="arrow_back" className="text-base" /> Volver a iniciar sesión
        </Link>
      }
    >
      {mensaje ? (
        <div role="status" className="space-y-4 rounded-2xl bg-tertiary-container/15 p-5 text-center">
          <Icono nombre="mark_email_read" className="text-4xl text-tertiary" />
          <p className="text-body-md text-on-surface">{mensaje}</p>
          <p className="text-body-sm text-on-surface-variant">El enlace vence en 1 hora y solo sirve una vez.</p>
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="font-label-md text-label-md text-primary hover:underline"
          >
            Enviar a otro correo
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-5">
          <CampoFormulario
            etiqueta="Correo de tu cuenta"
            icono="mail"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-2xl bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
              <Icono nombre="error" className="text-lg" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary py-3.5 font-label-lg text-label-lg font-bold text-on-primary shadow-lg shadow-primary-container/40 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
          >
            {enviando ? <Spinner tamano={18} colores="border-on-primary/30 border-t-on-primary" /> : <Icono nombre="send" className="text-xl" />}
            Enviar enlace
          </button>
        </form>
      )}
    </PlantillaAcceso>
  )
}
