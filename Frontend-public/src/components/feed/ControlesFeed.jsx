import Icono from '../ui/Icono'

const dosDigitos = (numero) => String(numero).padStart(2, '0')

/** Ala izquierda del feed: anterior/siguiente, contador, modo cine y autoavance. */
export default function ControlesFeed({
  indice,
  total,
  hayMas,
  onAnterior,
  onSiguiente,
  modoCine,
  onModoCine,
  autoAvance,
  onAutoAvance,
  className = '',
}) {
  return (
    <aside className={`shrink-0 flex-col items-center justify-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={onAnterior}
        disabled={indice <= 0}
        aria-label="Video anterior"
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface shadow-lg transition-transform hover:bg-surface-bright active:scale-95 disabled:opacity-40"
      >
        <Icono nombre="keyboard_arrow_up" className="text-2xl transition-transform group-hover:-translate-y-0.5" />
      </button>
      <span className="py-2 font-label-sm text-label-sm tracking-wider text-outline uppercase [writing-mode:vertical-rl]">
        Proyectada {dosDigitos(Math.min(indice + 1, total))}/{dosDigitos(total)}
        {hayMas ? '+' : ''}
      </span>
      <button
        type="button"
        onClick={onSiguiente}
        disabled={indice >= total - 1 && !hayMas}
        aria-label="Siguiente video"
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface shadow-lg transition-transform hover:bg-surface-bright active:scale-95 disabled:opacity-40"
      >
        <Icono nombre="keyboard_arrow_down" className="text-2xl transition-transform group-hover:translate-y-0.5" />
      </button>
      <div className="my-2 h-12 w-px bg-surface-container-highest" />
      <button
        type="button"
        onClick={onModoCine}
        aria-pressed={modoCine}
        title={modoCine ? 'Salir del modo cine' : 'Modo cine (oculta los comentarios)'}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          modoCine ? 'bg-primary-container/25 text-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
        }`}
      >
        <Icono nombre="fit_screen" className="text-xl" />
      </button>
      <button
        type="button"
        onClick={onAutoAvance}
        aria-pressed={autoAvance}
        title={autoAvance ? 'Autoavance activado: pasa al siguiente video al terminar' : 'Activar autoavance'}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          autoAvance ? 'bg-secondary-container/25 text-secondary' : 'bg-surface-container-low text-on-surface-variant hover:text-secondary'
        }`}
      >
        <Icono nombre="autorenew" className="text-xl" />
      </button>
    </aside>
  )
}
