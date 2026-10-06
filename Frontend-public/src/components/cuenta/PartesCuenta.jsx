import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

/** Tarjeta de una sección de Configuración. `peligro` la marca en rojo (eliminar la cuenta). */
export function TarjetaCuenta({ icono, titulo, descripcion, peligro = false, children }) {
  return (
    <section
      className={`flex flex-col gap-space-md rounded-xl p-space-lg shadow-lg ${
        peligro ? 'bg-error-container/10 ring-1 ring-error/30' : 'bg-surface-container'
      }`}
    >
      <div className="flex items-start gap-space-sm">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            peligro ? 'bg-error/15 text-error' : 'bg-primary-container/20 text-primary'
          }`}
        >
          <Icono nombre={icono} className="text-xl" />
        </span>
        <div className="min-w-0">
          <h2 className="font-title-md text-title-md font-bold text-on-surface">{titulo}</h2>
          {descripcion && <p className="mt-0.5 font-body-sm text-body-sm break-words text-on-surface-variant">{descripcion}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export function MensajeError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="flex items-start gap-2 rounded-2xl bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
      <Icono nombre="error" className="text-lg" /> {children}
    </p>
  )
}

/** Botón para enviar un formulario de Configuración. */
export function BotonCuenta({ enviando, icono, children, peligro = false, ...props }) {
  return (
    <button
      type="submit"
      disabled={enviando}
      className={`flex items-center justify-center gap-2 self-start rounded-full px-space-lg py-2.5 font-label-md text-label-md font-bold transition-all disabled:opacity-60 ${
        peligro
          ? 'bg-error text-on-error hover:shadow-[0_0_20px_rgba(255,180,171,0.35)]'
          : 'bg-primary-container text-on-primary-container hover:shadow-[0_0_20px_rgba(160,120,255,0.45)]'
      }`}
      {...props}
    >
      {enviando ? <Spinner tamano={16} /> : <Icono nombre={icono} className="text-lg" />}
      {children}
    </button>
  )
}
