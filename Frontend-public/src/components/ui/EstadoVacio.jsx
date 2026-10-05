import Icono from './Icono'

export default function EstadoVacio({ icono = 'movie', titulo, mensaje, children, compacto = false, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 text-center ${compacto ? 'py-8' : 'py-12'} ${className}`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-primary shadow-[0_0_24px_rgba(160,120,255,0.25)]">
        <Icono nombre={icono} className="text-3xl" />
      </span>
      <h3 className="font-headline-sm text-headline-sm text-on-surface">{titulo}</h3>
      {mensaje && <p className="max-w-sm text-body-md text-on-surface-variant">{mensaje}</p>}
      {children}
    </div>
  )
}
