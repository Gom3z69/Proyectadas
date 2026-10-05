import { useState } from 'react'
import { Link } from 'react-router'
import PlantillaAcceso from '../components/layout/PlantillaAcceso'
import CampoFormulario from '../components/ui/CampoFormulario'
import Icono from '../components/ui/Icono'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      // Al iniciar sesión, RutaPublica redirige automáticamente a la página de origen.
      await iniciarSesion(identificador.trim(), password)
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  return (
    <PlantillaAcceso
      titulo="Bienvenido de vuelta"
      subtitulo="Inicia sesión para seguir proyectando."
      pie={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-bold text-primary hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-5">
        <CampoFormulario
          etiqueta="Usuario o correo"
          icono="person"
          value={identificador}
          onChange={(evento) => setIdentificador(evento.target.value)}
          placeholder="@usuario o correo@ejemplo.com"
          autoComplete="username"
          autoCapitalize="none"
          required
        />
        <CampoFormulario
          etiqueta="Contraseña"
          icono="lock"
          type="password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          placeholder="Tu contraseña"
          autoComplete="current-password"
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
          {enviando ? <Spinner tamano={18} colores="border-on-primary/30 border-t-on-primary" /> : <Icono nombre="login" className="text-xl" />}
          Iniciar sesión
        </button>
      </form>
    </PlantillaAcceso>
  )
}
