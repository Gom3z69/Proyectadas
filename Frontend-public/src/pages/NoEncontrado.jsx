import { Link } from 'react-router'
import Icono from '../components/ui/Icono'
import Logo from '../components/ui/Logo'

export default function NoEncontrado() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-background px-6 text-center">
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-primary-container/15 blur-[150px]" />
      <Logo />
      <div className="relative space-y-3">
        <p className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text font-headline-xl text-[96px] leading-none font-extrabold text-transparent">
          404
        </p>
        <h1 className="font-headline-md text-headline-md text-on-surface">Esta escena no existe</h1>
        <p className="text-body-md text-on-surface-variant">La página que buscas fue movida o nunca se proyectó.</p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label-lg text-label-lg font-bold text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)]"
      >
        <Icono nombre="home" className="text-lg" /> Volver al inicio
      </Link>
    </div>
  )
}
