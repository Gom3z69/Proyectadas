import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { useToast } from '../../hooks/useToast'
import { desbloquear, listarBloqueados } from '../../services/usuarioService'
import { tiempoRelativo } from '../../utils/formato'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'
import { TarjetaCuenta } from './PartesCuenta'

/** Cuentas que bloqueaste, con la opción de desbloquearlas. */
export default function CuentasBloqueadas() {
  const toast = useToast()
  const cargarPagina = useCallback(async (pagina) => {
    const datos = await listarBloqueados(pagina)
    return { items: datos.usuarios, hayMas: datos.hayMas }
  }, [])
  const lista = useListaPaginada(cargarPagina)
  const [procesando, setProcesando] = useState(null)

  async function desbloquearCuenta(cuenta) {
    setProcesando(cuenta.id)
    try {
      await desbloquear(cuenta.username)
      lista.quitarItem(cuenta.id)
      toast.exito(`Desbloqueaste a @${cuenta.username}`)
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setProcesando(null)
    }
  }

  return (
    <TarjetaCuenta
      icono="block"
      titulo="Cuentas bloqueadas"
      descripcion="No ves su contenido y ellas no pueden ver el tuyo ni interactuar contigo."
    >
      {lista.items.length > 0 && (
        <ul className="flex flex-col divide-y divide-surface-container-highest">
          {lista.items.map((cuenta) => (
            <li key={cuenta.id} className="flex items-center gap-space-sm py-2.5">
              <Avatar usuario={cuenta} tamano={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-label-lg text-label-lg text-on-surface">{cuenta.nombre}</p>
                <p className="truncate font-label-sm text-label-sm text-outline">
                  @{cuenta.username} · bloqueada {tiempoRelativo(cuenta.bloqueadoEn)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => desbloquearCuenta(cuenta)}
                disabled={procesando === cuenta.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
              >
                {procesando === cuenta.id && <Spinner tamano={14} />} Desbloquear
              </button>
            </li>
          ))}
        </ul>
      )}
      {lista.cargando && (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      )}
      {!lista.cargando && lista.error && <p className="text-body-sm text-error">{lista.error}</p>}
      {!lista.cargando && !lista.error && lista.items.length === 0 && (
        <p className="font-body-sm text-body-sm text-outline">
          No has bloqueado a nadie. Puedes hacerlo desde el menú de una proyectada o desde el perfil de la cuenta.{' '}
          <Link to="/soporte" className="text-primary hover:underline">
            Más ayuda
          </Link>
        </p>
      )}
      {!lista.cargando && lista.hayMas && lista.items.length > 0 && (
        <button type="button" onClick={lista.cargarMas} className="self-start font-label-md text-label-md text-primary hover:underline">
          Ver más
        </button>
      )}
    </TarjetaCuenta>
  )
}
