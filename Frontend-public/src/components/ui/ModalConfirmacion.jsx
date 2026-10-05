import Modal from './Modal'
import Spinner from './Spinner'

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligroso = false,
  procesando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={procesando ? () => {} : onCancelar}
      titulo={titulo}
      ancho="sm:max-w-md"
      pie={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="rounded-full px-5 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-label-lg text-label-lg font-bold transition-all active:scale-95 disabled:opacity-60 ${
              peligroso
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] hover:bg-primary-fixed'
            }`}
          >
            {procesando && <Spinner tamano={16} colores="border-current/30 border-t-current" />}
            {textoConfirmar}
          </button>
        </div>
      }
    >
      <p className="px-6 pb-2 text-body-md text-on-surface-variant">{mensaje}</p>
    </Modal>
  )
}
