import Spinner from './Spinner'

/** Mientras se descarga una página que se carga aparte (dentro del diseño, sin ocultar el encabezado). */
export default function CargandoPagina() {
  return (
    <div className="flex justify-center py-24">
      <Spinner />
    </div>
  )
}
