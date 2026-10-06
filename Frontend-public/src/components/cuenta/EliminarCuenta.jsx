import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { eliminarCuenta } from '../../services/usuarioService'
import CampoFormulario from '../ui/CampoFormulario'
import Icono from '../ui/Icono'
import Modal from '../ui/Modal'
import { BotonCuenta, MensajeError, TarjetaCuenta } from './PartesCuenta'

/** Zona de peligro: elimina la cuenta y todo su contenido (pide la contraseña). */
export default function EliminarCuenta() {
  const { cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function cerrar() {
    if (enviando) return
    setAbierto(false)
    setPassword('')
    setError(null)
  }

  async function confirmar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await eliminarCuenta(password)
      cerrarSesion('Tu cuenta y todo su contenido se eliminaron. Gracias por haber proyectado con nosotros.')
      navigate('/login', { replace: true })
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  return (
    <TarjetaCuenta
      icono="delete_forever"
      titulo="Eliminar mi cuenta"
      descripcion="Borra para siempre tu perfil, tus proyectadas y borradores, tus comentarios, me gusta, favoritos y seguidores. Tu insignia y tu racha se pierden."
      peligro
    >
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 self-start rounded-full bg-error/15 px-space-lg py-2.5 font-label-md text-label-md font-bold text-error transition-colors hover:bg-error/25"
      >
        <Icono nombre="delete_forever" className="text-lg" /> Eliminar mi cuenta
      </button>

      <Modal abierto={abierto} onCerrar={cerrar} titulo="¿Eliminar tu cuenta?" ancho="sm:max-w-md">
        <form onSubmit={confirmar} className="flex flex-col gap-space-md px-6 pt-2 pb-6">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Esta acción <strong className="text-error">no se puede deshacer</strong>. Se borrará todo lo que hiciste en
            PROYECTADAS y nadie podrá volver a ver tu perfil.
          </p>
          <CampoFormulario
            etiqueta="Escribe tu contraseña para confirmar"
            icono="lock"
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
            required
          />
          <MensajeError>{error}</MensajeError>
          <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cerrar}
              disabled={enviando}
              className="rounded-full px-space-lg py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              Cancelar
            </button>
            <BotonCuenta enviando={enviando} icono="delete_forever" peligro>
              Eliminar para siempre
            </BotonCuenta>
          </div>
        </form>
      </Modal>
    </TarjetaCuenta>
  )
}
