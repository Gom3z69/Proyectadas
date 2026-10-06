import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { reportar } from '../../services/reporteService'
import { MOTIVOS_REPORTE } from '../../utils/reportes'
import Icono from '../ui/Icono'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

const MAX_DETALLE = 300

/**
 * Reportar una proyectada, un comentario o una cuenta.
 * objetivo: { tipo: 'video' | 'comentario' | 'usuario', id, titulo }.
 * Quien reporta un video o comentario deja de verlo: `onReportado` debe quitarlo de la pantalla.
 */
export default function ModalReporte({ objetivo, onCerrar, onReportado }) {
  const toast = useToast()
  const [motivo, setMotivo] = useState(null)
  const [detalle, setDetalle] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cerrar() {
    if (enviando) return
    setMotivo(null)
    setDetalle('')
    onCerrar()
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (!motivo || enviando) return
    setEnviando(true)
    try {
      const respuesta = await reportar({ tipo: objetivo.tipo, id: objetivo.id, motivo, detalle: detalle.trim() })
      const oculto = objetivo.tipo !== 'usuario'
      toast.exito(
        respuesta.yaReportado ? 'Ya lo habías reportado' : 'Gracias por tu reporte',
        oculto ? 'Ya no lo verás. El equipo de moderación lo revisará.' : 'El equipo de moderación lo revisará.',
      )
      setMotivo(null)
      setDetalle('')
      onReportado?.(respuesta)
    } catch (fallo) {
      toast.error(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal abierto={Boolean(objetivo)} onCerrar={cerrar} titulo={objetivo?.titulo ?? 'Reportar'} ancho="sm:max-w-md">
      <form onSubmit={enviar} className="flex flex-col gap-space-md px-6 pt-2 pb-6">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          ¿Por qué lo reportas? La persona reportada no sabrá quién fue.
        </p>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="sr-only">Motivo del reporte</legend>
          {MOTIVOS_REPORTE.map((opcion) => {
            const elegido = motivo === opcion.clave
            return (
              <label
                key={opcion.clave}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-label-lg text-label-lg transition-colors ${
                  elegido ? 'bg-primary-container/20 text-on-surface ring-1 ring-primary/60' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <input
                  type="radio"
                  name="motivo-reporte"
                  value={opcion.clave}
                  checked={elegido}
                  onChange={() => setMotivo(opcion.clave)}
                  className="h-4 w-4 accent-primary"
                />
                {opcion.texto}
              </label>
            )
          })}
        </fieldset>
        <div className="flex flex-col gap-1">
          <label htmlFor="detalle-reporte" className="font-label-md text-label-md text-on-surface">
            Detalles (opcional)
          </label>
          <textarea
            id="detalle-reporte"
            value={detalle}
            onChange={(evento) => setDetalle(evento.target.value.slice(0, MAX_DETALLE))}
            rows={2}
            placeholder="Cuéntanos qué pasó"
            className="w-full resize-none rounded-xl bg-surface-container p-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:bg-surface-container-high focus:ring-1 focus:ring-primary/60 focus:outline-none"
          />
          <span className="self-end font-label-sm text-label-sm text-outline">
            {detalle.length} / {MAX_DETALLE}
          </span>
        </div>
        <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cerrar}
            disabled={enviando}
            className="rounded-full px-5 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!motivo || enviando}
            className="flex items-center justify-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-lg text-label-lg font-bold text-on-error transition-all active:scale-95 disabled:opacity-50"
          >
            {enviando ? <Spinner tamano={16} colores="border-current/30 border-t-current" /> : <Icono nombre="flag" className="text-lg" />}
            Enviar reporte
          </button>
        </div>
      </form>
    </Modal>
  )
}
