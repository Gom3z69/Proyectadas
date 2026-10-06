import { useCallback, useState } from 'react'
import TarjetaReporte from '../components/moderacion/TarjetaReporte'
import Avatar from '../components/ui/Avatar'
import EstadoVacio from '../components/ui/EstadoVacio'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { useToast } from '../hooks/useToast'
import { listarReportes, listarSuspendidas, reactivarCuenta, resolverReporte } from '../services/moderacionService'
import { tiempoRelativo } from '../utils/formato'

const PESTANAS = [
  { clave: 'pendiente', texto: 'Pendientes' },
  { clave: 'resuelto', texto: 'Resueltos' },
  { clave: 'descartado', texto: 'Descartados' },
  { clave: 'suspendidas', texto: 'Cuentas suspendidas' },
]

const VACIOS = {
  pendiente: { icono: 'verified_user', titulo: 'Nada por revisar', mensaje: 'Cuando la comunidad reporte algo, aparecerá aquí.' },
  resuelto: { icono: 'task_alt', titulo: 'Sin reportes resueltos', mensaje: 'Aquí quedan los reportes que atendiste.' },
  descartado: { icono: 'do_not_disturb_on', titulo: 'Sin reportes descartados', mensaje: 'Aquí quedan los reportes que no requerían acción.' },
}

const MENSAJES = {
  eliminar: 'Contenido eliminado',
  suspender: 'Cuenta suspendida',
  descartar: 'Reporte descartado',
}

/** Confirmación de las acciones que no se pueden deshacer fácilmente. */
function confirmacion({ grupo, accion }) {
  if (accion === 'suspender') {
    return {
      titulo: `¿Suspender a @${grupo.usuario?.username}?`,
      mensaje: 'No podrá iniciar sesión y todo su contenido quedará oculto hasta que reactives la cuenta.',
      texto: 'Suspender',
    }
  }
  return grupo.tipo === 'video'
    ? {
        titulo: '¿Eliminar esta proyectada?',
        mensaje: 'Se borrará para siempre con sus comentarios. Si era parte de la racha de su creador, su progreso bajará en 1.',
        texto: 'Eliminar',
      }
    : { titulo: '¿Eliminar este comentario?', mensaje: 'Se borrará junto con sus respuestas.', texto: 'Eliminar' }
}

function ListaReportes({ estado, onPendientes }) {
  const toast = useToast()
  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = await listarReportes(estado, pagina)
      onPendientes(datos.pendientes)
      return { items: datos.grupos, hayMas: datos.hayMas }
    },
    [estado, onPendientes],
  )
  const lista = useListaPaginada(cargarPagina)
  const [porConfirmar, setPorConfirmar] = useState(null) // { grupo, accion }
  const [procesando, setProcesando] = useState(false)

  async function ejecutar(grupo, accion) {
    setProcesando(true)
    try {
      const { pendientes } = await resolverReporte(grupo.id, accion)
      // Al suspender se cierran también los demás reportes de esa cuenta.
      if (accion === 'suspender') lista.quitarDonde((otro) => otro.usuario?.id === grupo.usuario?.id)
      else lista.quitarItem(grupo.id)
      onPendientes(pendientes)
      toast.exito(MENSAJES[accion])
      setPorConfirmar(null)
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setProcesando(false)
    }
  }

  function pedirAccion(grupo, accion) {
    if (accion === 'descartar') ejecutar(grupo, accion)
    else setPorConfirmar({ grupo, accion })
  }

  const textos = porConfirmar && confirmacion(porConfirmar)

  return (
    <div className="flex flex-col gap-space-md">
      {lista.items.map((grupo) => (
        <TarjetaReporte key={grupo.id} grupo={grupo} pendiente={estado === 'pendiente'} procesando={procesando} onAccion={pedirAccion} />
      ))}
      {lista.cargando && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
      {!lista.cargando && lista.error && <p className="text-center text-body-sm text-error">{lista.error}</p>}
      {!lista.cargando && !lista.error && lista.items.length === 0 && <EstadoVacio compacto {...VACIOS[estado]} />}
      {!lista.cargando && lista.hayMas && lista.items.length > 0 && (
        <button type="button" onClick={lista.cargarMas} className="self-center font-label-md text-label-md text-primary hover:underline">
          Ver más reportes
        </button>
      )}

      <ModalConfirmacion
        abierto={Boolean(porConfirmar)}
        titulo={textos?.titulo}
        mensaje={textos?.mensaje}
        textoConfirmar={textos?.texto}
        peligroso
        procesando={procesando}
        onConfirmar={() => ejecutar(porConfirmar.grupo, porConfirmar.accion)}
        onCancelar={() => setPorConfirmar(null)}
      />
    </div>
  )
}

function ListaSuspendidas() {
  const toast = useToast()
  const cargarPagina = useCallback(async (pagina) => {
    const datos = await listarSuspendidas(pagina)
    return { items: datos.usuarios, hayMas: datos.hayMas }
  }, [])
  const lista = useListaPaginada(cargarPagina)
  const [procesando, setProcesando] = useState(null)

  async function reactivar(cuenta) {
    setProcesando(cuenta.id)
    try {
      await reactivarCuenta(cuenta.id)
      lista.quitarItem(cuenta.id)
      toast.exito(`@${cuenta.username} puede volver a entrar`)
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setProcesando(null)
    }
  }

  if (!lista.cargando && !lista.error && lista.items.length === 0) {
    return <EstadoVacio compacto icono="group" titulo="No hay cuentas suspendidas" mensaje="Las cuentas que suspendas aparecerán aquí." />
  }

  return (
    <ul className="flex flex-col gap-space-sm">
      {lista.items.map((cuenta) => (
        <li key={cuenta.id} className="flex items-center gap-space-sm rounded-xl bg-surface-container p-space-sm shadow-md">
          <Avatar usuario={cuenta} tamano={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-label-lg text-label-lg text-on-surface">{cuenta.nombre}</p>
            <p className="truncate font-label-sm text-label-sm text-outline">
              @{cuenta.username} · suspendida {tiempoRelativo(cuenta.suspendidaEn)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => reactivar(cuenta)}
            disabled={procesando === cuenta.id}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-container px-4 py-2 font-label-md text-label-md font-bold text-on-primary-container disabled:opacity-60"
          >
            {procesando === cuenta.id && <Spinner tamano={14} />} Reactivar
          </button>
        </li>
      ))}
      {lista.cargando && (
        <li className="flex justify-center py-6">
          <Spinner />
        </li>
      )}
    </ul>
  )
}

/** Panel de moderación (solo administradores): reportes de la comunidad y cuentas suspendidas. */
export default function Moderacion() {
  const { usuario } = useAuth()
  const [pestana, setPestana] = useState('pendiente')
  const [pendientes, setPendientes] = useState(null)

  if (!usuario.esAdmin) {
    return (
      <div className="px-space-lg py-space-xl">
        <EstadoVacio icono="lock" titulo="Solo para administradores" mensaje="Esta página es para el equipo de moderación." />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg">
      <header className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]" />
          <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">Panel de moderación</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-xl md:text-headline-xl">
          Moderación
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Revisa lo que reporta la comunidad. Lo más reportado aparece primero.
        </p>
      </header>

      <div className="sin-scrollbar flex gap-space-xs overflow-x-auto pb-1" role="tablist">
        {PESTANAS.map((opcion) => {
          const activa = opcion.clave === pestana
          return (
            <button
              key={opcion.clave}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setPestana(opcion.clave)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-all ${
                activa
                  ? 'bg-primary-container font-bold text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {opcion.texto}
              {opcion.clave === 'pendiente' && pendientes > 0 && (
                <span className="rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-on-error">{pendientes}</span>
              )}
            </button>
          )
        })}
      </div>

      {pestana === 'suspendidas' ? (
        <ListaSuspendidas />
      ) : (
        <ListaReportes key={pestana} estado={pestana} onPendientes={setPendientes} />
      )}
    </div>
  )
}
