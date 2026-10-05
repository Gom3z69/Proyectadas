import { useState } from 'react'
import { Link } from 'react-router'
import PlantillaAcceso from '../components/layout/PlantillaAcceso'
import CampoFormulario from '../components/ui/CampoFormulario'
import Icono from '../components/ui/Icono'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

const INICIAL = { nombre: '', username: '', email: '', password: '' }

export default function Registro() {
  const { registrarse } = useAuth()
  const [datos, setDatos] = useState(INICIAL)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo, transformar = (valor) => valor) => (evento) =>
    setDatos((actuales) => ({ ...actuales, [campo]: transformar(evento.target.value) }))

  async function enviar(evento) {
    evento.preventDefault()
    if (datos.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setError(null)
    setEnviando(true)
    try {
      await registrarse({ ...datos, nombre: datos.nombre.trim(), email: datos.email.trim() })
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  return (
    <PlantillaAcceso
      titulo="Crea tu cuenta"
      subtitulo="Empieza a publicar y gana tu primera insignia: Bronce."
      pie={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-5">
        <CampoFormulario
          etiqueta="Nombre"
          icono="badge"
          value={datos.nombre}
          onChange={cambiar('nombre')}
          placeholder="Tu nombre"
          autoComplete="name"
          minLength={2}
          maxLength={50}
          required
        />
        <CampoFormulario
          etiqueta="Nombre de usuario"
          icono="alternate_email"
          value={datos.username}
          onChange={cambiar('username', (valor) => valor.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
          placeholder="tu_usuario"
          autoComplete="username"
          autoCapitalize="none"
          minLength={3}
          maxLength={24}
          ayuda="De 3 a 24 caracteres: letras, números, punto o guion bajo."
          required
        />
        <CampoFormulario
          etiqueta="Correo"
          icono="mail"
          type="email"
          value={datos.email}
          onChange={cambiar('email')}
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          required
        />
        <CampoFormulario
          etiqueta="Contraseña"
          icono="lock"
          type="password"
          value={datos.password}
          onChange={cambiar('password')}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
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
          {enviando ? <Spinner tamano={18} colores="border-on-primary/30 border-t-on-primary" /> : <Icono nombre="person_add" className="text-xl" />}
          Crear cuenta
        </button>
        <p className="text-center text-body-sm text-on-surface-variant">
          Al crear tu cuenta aceptas los{' '}
          <Link to="/terminos" className="font-semibold text-primary hover:underline">
            Términos de Servicio
          </Link>{' '}
          y la{' '}
          <Link to="/privacidad" className="font-semibold text-primary hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </form>
    </PlantillaAcceso>
  )
}
