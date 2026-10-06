import CuentasBloqueadas from '../components/cuenta/CuentasBloqueadas'
import EliminarCuenta from '../components/cuenta/EliminarCuenta'
import FormCorreo from '../components/cuenta/FormCorreo'
import FormPassword from '../components/cuenta/FormPassword'

/** Configuración de la cuenta: correo, contraseña, cuentas bloqueadas y eliminar la cuenta. */
export default function Configuracion() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg">
      <header className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]" />
          <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">Cuenta y seguridad</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-xl md:text-headline-xl">
          Configuración
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cambia tu correo o tu contraseña y administra tu cuenta. Tu nombre, biografía y foto se editan desde tu perfil.
        </p>
      </header>

      <FormCorreo />
      <FormPassword />
      <CuentasBloqueadas />
      <EliminarCuenta />
    </div>
  )
}
