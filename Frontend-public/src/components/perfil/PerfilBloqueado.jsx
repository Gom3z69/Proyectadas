import { useState } from 'react'
import { Link } from 'react-router'
import { useToast } from '../../hooks/useToast'
import { desbloquear } from '../../services/usuarioService'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

/** Perfil de una cuenta que bloqueaste: solo muestra quién es y la opción de desbloquearla. */
export default function PerfilBloqueado({ perfil, onDesbloqueado }) {
  const toast = useToast()
  const [procesando, setProcesando] = useState(false)

  async function desbloquearCuenta() {
    setProcesando(true)
    try {
      await desbloquear(perfil.username)
      toast.exito(`Desbloqueaste a @${perfil.username}`, 'Si quieres volver a seguirla, hazlo desde su perfil.')
      onDesbloqueado()
    } catch (fallo) {
      toast.error(fallo.message)
      setProcesando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-space-md px-space-lg py-space-xl text-center">
      <div className="opacity-60 grayscale">
        <Avatar usuario={perfil} tamano={96} />
      </div>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">{perfil.nombre}</h1>
        <p className="font-label-md text-label-md text-outline">@{perfil.username}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-space-sm rounded-xl bg-surface-container p-space-lg shadow-lg">
        <Icono nombre="block" className="text-3xl text-error" />
        <p className="font-body-md text-body-md text-on-surface">Bloqueaste a esta cuenta.</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No ves su contenido ni sus comentarios, y no puede ver tu perfil ni interactuar contigo.
        </p>
        <button
          type="button"
          onClick={desbloquearCuenta}
          disabled={procesando}
          className="mt-space-xs flex items-center gap-2 rounded-full bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary-container transition-shadow hover:shadow-[0_0_20px_rgba(160,120,255,0.45)] disabled:opacity-60"
        >
          {procesando ? <Spinner tamano={16} /> : <Icono nombre="lock_open" className="text-lg" />} Desbloquear
        </button>
      </div>
      <Link to="/" className="font-label-md text-label-md text-primary hover:underline">
        Volver al Feed
      </Link>
    </div>
  )
}
