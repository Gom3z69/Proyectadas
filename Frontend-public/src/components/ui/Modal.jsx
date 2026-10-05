import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useCapaModal } from '../../hooks/useCapaModal'
import Icono from './Icono'

/** Ventana modal. En el celular se abre como hoja desde abajo. */
export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'sm:max-w-lg', pie }) {
  const panel = useRef(null)
  useCapaModal(abierto, onCerrar, panel)

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-aparecer bg-black/70 backdrop-blur-sm" onClick={onCerrar} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full animate-subir flex-col overflow-hidden rounded-t-3xl bg-surface-container-low shadow-2xl shadow-black/70 outline-none sm:rounded-3xl ${ancho}`}
      >
        <span className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-surface-container-highest sm:hidden" aria-hidden="true" />
        {titulo && (
          <header className="flex shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2 sm:pt-6">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{titulo}</h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Icono nombre="close" className="text-xl" />
            </button>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {pie && <footer className="shrink-0 px-6 pt-2 pb-6">{pie}</footer>}
      </div>
    </div>,
    document.body,
  )
}
