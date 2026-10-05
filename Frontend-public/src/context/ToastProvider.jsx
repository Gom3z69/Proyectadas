import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Icono from '../components/ui/Icono'
import IconoInsignia from '../components/insignias/IconoInsignia'
import { ToastContext } from './contextos'

const APARIENCIA = {
  exito: { icono: 'check_circle', acento: 'bg-tertiary', color: 'text-tertiary' },
  error: { icono: 'error', acento: 'bg-error', color: 'text-error' },
  info: { icono: 'info', acento: 'bg-secondary', color: 'text-secondary' },
  insignia: { icono: 'military_tech', acento: 'bg-gradient-to-b from-primary via-secondary to-tertiary', color: 'text-primary' },
}

let contador = 0

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const cerrar = useCallback((id) => {
    setToasts((lista) => lista.filter((toast) => toast.id !== id))
  }, [])

  const mostrar = useCallback(
    (toast) => {
      contador += 1
      const id = contador
      setToasts((lista) => [...lista.slice(-3), { ...toast, id }])
      setTimeout(() => cerrar(id), toast.duracion ?? 4000)
    },
    [cerrar],
  )

  const api = useMemo(
    () => ({
      exito: (titulo, mensaje) => mostrar({ tipo: 'exito', titulo, mensaje }),
      error: (mensaje, titulo = 'Algo salió mal') => mostrar({ tipo: 'error', titulo, mensaje, duracion: 5500 }),
      info: (titulo, mensaje) => mostrar({ tipo: 'info', titulo, mensaje }),
      insignia: (nivel, titulo, mensaje) => mostrar({ tipo: 'insignia', nivel, titulo, mensaje, duracion: 6500 }),
    }),
    [mostrar],
  )

  return (
    <ToastContext value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 top-24 z-[200] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:items-end"
        >
          {toasts.map((toast) => {
            const estilo = APARIENCIA[toast.tipo]
            return (
              <div
                key={toast.id}
                role={toast.tipo === 'error' ? 'alert' : 'status'}
                className="pointer-events-auto relative flex w-full max-w-sm animate-entrar-derecha items-start gap-3 overflow-hidden rounded-2xl bg-surface-container-high/95 p-4 pl-5 shadow-2xl shadow-black/60 backdrop-blur-xl"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${estilo.acento}`} />
                {toast.tipo === 'insignia' ? (
                  <IconoInsignia nivel={toast.nivel} tamano={28} className="shrink-0" />
                ) : (
                  <Icono nombre={estilo.icono} relleno className={`shrink-0 text-xl ${estilo.color}`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-title-md text-label-lg font-bold text-on-surface">{toast.titulo}</p>
                  {toast.mensaje && <p className="mt-0.5 text-body-sm text-on-surface-variant">{toast.mensaje}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => cerrar(toast.id)}
                  aria-label="Cerrar aviso"
                  className="shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                >
                  <Icono nombre="close" className="text-base" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext>
  )
}
