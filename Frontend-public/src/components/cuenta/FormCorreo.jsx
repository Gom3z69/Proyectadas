import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cambiarCorreo } from '../../services/usuarioService'
import CampoFormulario from '../ui/CampoFormulario'
import { BotonCuenta, MensajeError, TarjetaCuenta } from './PartesCuenta'

/** Cambia el correo de la cuenta (pide la contraseña actual). */
export default function FormCorreo() {
  const { usuario, actualizarUsuario } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const { usuario: actualizado } = await cambiarCorreo(email.trim(), password)
      actualizarUsuario({ email: actualizado.email })
      setEmail('')
      setPassword('')
      toast.exito('Correo actualizado', `Ahora tu cuenta usa ${actualizado.email}. Avisamos a tu correo anterior.`)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TarjetaCuenta
      icono="alternate_email"
      titulo="Correo de la cuenta"
      descripcion={`Tu usuario es @${usuario.username} y tu correo actual es ${usuario.email}.`}
    >
      <form onSubmit={enviar} className="flex flex-col gap-space-md">
        <div className="grid gap-space-md md:grid-cols-2">
          <CampoFormulario
            etiqueta="Correo nuevo"
            icono="mail"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />
          <CampoFormulario
            etiqueta="Contraseña para confirmar"
            icono="lock"
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <MensajeError>{error}</MensajeError>
        <BotonCuenta enviando={enviando} icono="save">
          Guardar correo
        </BotonCuenta>
      </form>
    </TarjetaCuenta>
  )
}
