import { useNivelesInsignia } from '../../hooks/useNivelesInsignia'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import Logo from '../ui/Logo'

/** Diseño compartido de Iniciar sesión y Registro: vitrina de la marca + tarjeta del formulario. */
export default function PlantillaAcceso({ titulo, subtitulo, children, pie }) {
  const niveles = useNivelesInsignia()

  return (
    <div className="relative grid min-h-dvh overflow-hidden bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full bg-primary-container/15 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[34rem] w-[34rem] rounded-full bg-secondary-container/10 blur-[170px]" />

      <section className="relative hidden flex-col justify-between p-12 xl:p-16 lg:flex">
        <Logo />
        <div className="max-w-xl space-y-8">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            Proyecta tu historia,{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              un video a la vez.
            </span>
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Mira proyectadas en un feed infinito, publica las tuyas cada día y sube de Bronce a Gran Maestro sin romper tu racha.
          </p>
          <ol className="flex flex-wrap gap-3">
            {niveles.map((nivel) => (
              <li
                key={nivel.clave}
                className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-low/80 px-4 py-3 backdrop-blur"
              >
                <IconoInsignia nivel={nivel.clave} tamano={30} />
                <span className={`font-label-md text-label-md ${ESTILOS_INSIGNIA[nivel.clave]?.claseTexto}`}>{nivel.nombre}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="font-label-sm text-label-sm text-outline">© {new Date().getFullYear()} PROYECTADAS · Stream &amp; Create</p>
      </section>

      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-surface-container-low/85 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">{titulo}</h2>
            <p className="text-body-md text-on-surface-variant">{subtitulo}</p>
          </div>
          {children}
          {pie && <div className="text-center text-body-md text-on-surface-variant">{pie}</div>}
        </div>
      </section>
    </div>
  )
}
