import logo from '../../assets/logo-proyectadas.svg'
import Spinner from './Spinner'

export default function PantallaCarga() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background">
      <img src={logo} alt="" className="h-16 w-16 animate-pulse drop-shadow-[0_0_24px_rgba(160,120,255,0.5)]" />
      <Spinner tamano={28} />
    </div>
  )
}
