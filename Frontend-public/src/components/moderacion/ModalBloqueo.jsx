import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { bloquear } from '../../services/usuarioService'
import ModalConfirmacion from '../ui/ModalConfirmacion'

/** Confirma y bloquea a `username` (abierto mientras haya username). `onBloqueado()` quita su contenido de la pantalla. */
export default function ModalBloqueo({ username, onCerrar, onBloqueado }) {
  const toast = useToast()
  const [procesando, setProcesando] = useState(false)

  async function confirmar() {
    setProcesando(true)
    try {
      await bloquear(username)
      toast.exito(`Bloqueaste a @${username}`, 'Puedes desbloquearlo cuando quieras desde Configuración.')
      onBloqueado?.()
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <ModalConfirmacion
      abierto={Boolean(username)}
      titulo={`¿Bloquear a @${username ?? ''}?`}
      mensaje="No verás su contenido ni sus comentarios, y no podrá ver tu perfil ni interactuar contigo. Si se seguían, dejarán de seguirse. No le avisaremos."
      textoConfirmar="Bloquear"
      peligroso
      procesando={procesando}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  )
}
