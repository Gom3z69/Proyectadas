import { useId, useState } from 'react'
import Icono from './Icono'

/** Campo con ícono; los de tipo password incluyen el botón para mostrar u ocultar. */
export default function CampoFormulario({ etiqueta, icono, type = 'text', ayuda, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const esPassword = type === 'password'

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-label-lg text-label-lg text-on-surface">
        {etiqueta}
      </label>
      <div className="group relative">
        <Icono
          nombre={icono}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-on-surface-variant transition-colors group-focus-within:text-primary"
        />
        <input
          id={id}
          type={esPassword && visible ? 'text' : type}
          className={`w-full rounded-2xl bg-surface-container py-3 pl-12 font-body-md text-body-md text-on-surface shadow-inner placeholder:text-outline focus:bg-surface-container-high focus:ring-1 focus:ring-primary focus:outline-none ${
            esPassword ? 'pr-12' : 'pr-4'
          }`}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((valor) => !valor)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <Icono nombre={visible ? 'visibility_off' : 'visibility'} className="text-xl" />
          </button>
        )}
      </div>
      {ayuda && <p className="text-body-sm text-outline">{ayuda}</p>}
    </div>
  )
}
