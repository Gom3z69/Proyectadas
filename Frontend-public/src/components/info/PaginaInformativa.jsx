import { NavLink } from 'react-router'
import Icono from '../ui/Icono'

const SECCIONES = [
  { a: '/privacidad', texto: 'Privacidad', icono: 'shield_lock' },
  { a: '/terminos', texto: 'Términos de Servicio', icono: 'gavel' },
  { a: '/insignias', texto: 'Insignias y Creadores', icono: 'military_tech' },
  { a: '/soporte', texto: 'Soporte', icono: 'support_agent' },
]

/** Bloque de contenido de una página informativa. */
export function Seccion({ icono, titulo, children }) {
  return (
    <section className="rounded-xl bg-surface-container p-space-lg shadow-lg">
      <h2 className="mb-space-sm flex items-center gap-space-xs font-title-md text-title-md font-bold text-on-surface">
        <Icono nombre={icono} className="text-2xl text-primary" /> {titulo}
      </h2>
      <div className="space-y-3 font-body-md text-body-md text-on-surface-variant [&_a]:font-semibold [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-on-surface [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}

/** Plantilla de Privacidad, Términos, Insignias y Soporte: navegación entre ellas y encabezado. */
export default function PaginaInformativa({ etiqueta, titulo, descripcion, actualizado, children }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg">
      <nav aria-label="Información de PROYECTADAS" className="sin-scrollbar -mx-1 flex gap-space-xs overflow-x-auto px-1 pb-1">
        {SECCIONES.map((seccion) => (
          <NavLink
            key={seccion.a}
            to={seccion.a}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-all ${
                isActive
                  ? 'bg-primary-container font-bold text-on-primary-container shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <Icono nombre={seccion.icono} className="text-lg" /> {seccion.texto}
          </NavLink>
        ))}
      </nav>

      <header className="flex flex-col gap-space-xs pt-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]" />
          <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">{etiqueta}</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-xl md:text-headline-xl">
          {titulo}
        </h1>
        <p className="max-w-3xl font-body-lg text-body-lg text-on-surface-variant">{descripcion}</p>
        {actualizado && <p className="font-label-sm text-label-sm text-outline">Última actualización: {actualizado}</p>}
      </header>

      <div className="flex flex-col gap-space-md">{children}</div>
    </div>
  )
}
