import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cambiarPassword } from '../../services/usuarioService'
import CampoFormulario from '../ui/CampoFormulario'
import { BotonCuenta, MensajeError, TarjetaCuenta } from './PartesCuenta'

const VACIO = { actual: '', nueva: '', repetida: '' }

/** Cambia la contraseña; las sesiones en otros dispositivos se cierran. */
export default function FormPassword() {
  const { abrirSesion } = useAuth()
  const toast = useToast()
  const [campos, setCampos] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const cambiar = (campo) => (evento) => setCampos((actuales) => ({ ...actuales, [campo]: evento.target.value }))

  async function enviar(evento) {
    evento.preventDefault()
    if (campos.nueva !== campos.repetida) return setError('La contraseña nueva y su repetición no coinciden.')
    setError(null)
    setEnviando(true)
    try {
      // La respuesta trae una sesión nueva: esta pestaña sigue conectada.
      abrirSesion(await cambiarPassword(campos.actual, campos.nueva))
      setCampos(VACIO)
      toast.exito('Contraseña actualizada', 'Cerramos la sesión en tus otros dispositivos.')
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TarjetaCuenta icono="key" titulo="Contraseña" descripcion="Al cambiarla se cerrará la sesión en tus otros dispositivos.">
      <form onSubmit={enviar} className="flex flex-col gap-space-md">
        <CampoFormulario
          etiqueta="Contraseña actual"
          icono="lock"
          type="password"
          value={campos.actual}
          onChange={cambiar('actual')}
          autoComplete="current-password"
          required
        />
        <div className="grid gap-space-md md:grid-cols-2">
          <CampoFormulario
            etiqueta="Contraseña nueva"
            icono="lock_reset"
            type="password"
            value={campos.nueva}
            onChange={cambiar('nueva')}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
          />
          <CampoFormulario
            etiqueta="Repite la contraseña nueva"
            icono="lock_reset"
            type="password"
            value={campos.repetida}
            onChange={cambiar('repetida')}
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
          />
        </div>
        <MensajeError>{error}</MensajeError>
        <BotonCuenta enviando={enviando} icono="key">
          Cambiar contraseña
        </BotonCuenta>
      </form>
    </TarjetaCuenta>
  )
}
