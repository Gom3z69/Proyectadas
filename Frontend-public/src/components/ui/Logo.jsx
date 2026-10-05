import { Link } from 'react-router'
import logo from '../../assets/logo-proyectadas.svg'

/** Logo + nombre de la plataforma (como en el encabezado de STITCH). */
export default function Logo({ conLema = true, className = '' }) {
  return (
    <Link to="/" className={`flex shrink-0 items-center gap-space-md ${className}`} aria-label="PROYECTADAS, ir al inicio">
      <img src={logo} alt="" className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(160,120,255,0.35)]" />
      <span className="flex flex-col justify-center">
        <span className="font-headline-sm text-headline-sm leading-none font-bold tracking-tight text-on-surface">
          PROYECTADAS
        </span>
        {conLema && (
          <span className="mt-space-xs font-label-sm text-label-sm font-bold tracking-widest text-primary uppercase drop-shadow-[0_0_8px_rgba(160,120,255,0.7)]">
            Stream &amp; Create
          </span>
        )}
      </span>
    </Link>
  )
}
