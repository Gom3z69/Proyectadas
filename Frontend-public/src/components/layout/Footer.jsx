import { Link } from 'react-router'

const ENLACES = [
  { a: '/privacidad', texto: 'Privacidad' },
  { a: '/terminos', texto: 'Términos de Servicio' },
  { a: '/insignias', texto: 'Insignias y Creadores' },
  { a: '/soporte', texto: 'Soporte' },
]

/** Pie de página. Con `sobreNavegacionMovil` deja espacio para la barra inferior del celular. */
export default function Footer({ sobreNavegacionMovil = false }) {
  return (
    <footer
      className={`mt-space-xl w-full bg-surface-container-lowest pt-space-xl ${sobreNavegacionMovil ? 'pb-32 md:pb-space-xl' : 'pb-space-xl'}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-space-md px-space-lg lg:flex-row lg:px-margin">
        <div className="flex flex-col items-center gap-space-sm text-center md:flex-row md:text-left">
          <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">PROYECTADAS</span>
          <span className="font-label-sm text-label-sm text-outline">
            © {new Date().getFullYear()} Plataforma de Descubrimiento Audiovisual.
          </span>
        </div>
        <nav
          aria-label="Información"
          className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-2 font-label-md text-label-md text-on-surface-variant"
        >
          {ENLACES.map((enlace) => (
            <Link key={enlace.a} to={enlace.a} className="transition-colors hover:text-primary">
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
