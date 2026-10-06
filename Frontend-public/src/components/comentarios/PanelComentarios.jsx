import { useCallback, useRef, useState } from 'react'
import { useClicFuera } from '../../hooks/useClicFuera'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { useRespuestas } from '../../hooks/useRespuestas'
import { useToast } from '../../hooks/useToast'
import { comentar, eliminarComentario, listarComentarios } from '../../services/comentarioService'
import { MAX_COMENTARIO } from '../../utils/comentarios'
import { formatearNumero } from '../../utils/formato'
import ModalReporte from '../moderacion/ModalReporte'
import EstadoVacio from '../ui/EstadoVacio'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'
import CampoComentario from './CampoComentario'
import ComentarioItem from './ComentarioItem'
import RespuestasComentario from './RespuestasComentario'

const ORDENES = [
  { clave: 'votados', texto: 'Más votados', icono: 'local_fire_department' },
  { clave: 'recientes', texto: 'Más recientes', icono: 'schedule' },
]

/** "Más votados ⌄": cambia el orden de los comentarios. */
function SelectorOrden({ valor, onCambiar }) {
  const [abierto, setAbierto] = useState(false)
  const menu = useRef(null)
  const actual = ORDENES.find((orden) => orden.clave === valor)

  useClicFuera(menu, () => setAbierto(false), abierto)

  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valorActual) => !valorActual)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Ordenar comentarios: ${actual.texto}`}
        className="flex items-center gap-1 rounded-md px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <span>{actual.texto}</span>
        <Icono nombre="keyboard_arrow_down" className={`text-xs transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div
          role="listbox"
          className="absolute top-full right-0 z-20 mt-1 w-48 animate-aparecer rounded-xl bg-surface-container-high p-1 shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40"
        >
          {ORDENES.map((orden) => {
            const elegido = orden.clave === valor
            return (
              <button
                key={orden.clave}
                type="button"
                role="option"
                aria-selected={elegido}
                onClick={() => {
                  setAbierto(false)
                  onCambiar(orden.clave)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-label-md text-label-md transition-colors hover:bg-surface-container-highest ${
                  elegido ? 'font-bold text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icono nombre={orden.icono} className="text-base" /> {orden.texto}
                {elegido && <Icono nombre="check" className="ml-auto text-base" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Lista de comentarios en un orden, con sus hilos de respuestas y el campo para escribir. */
function HiloComentarios({ video, orden, texto, onTexto, onConteo, idCampo }) {
  const toast = useToast()
  const campo = useRef(null)
  const cargarPagina = useCallback(
    async (pagina) => {
      const datos = await listarComentarios(video.id, pagina, orden)
      return { items: datos.comentarios, hayMas: datos.hayMas }
    },
    [video.id, orden],
  )
  const lista = useListaPaginada(cargarPagina)
  const respuestas = useRespuestas()
  const [respondiendoA, setRespondiendoA] = useState(null) // { id, raizId, username }
  const [reportando, setReportando] = useState(null) // comentario que se está reportando

  function responder(comentario) {
    setRespondiendoA({ id: comentario.id, raizId: comentario.respuestaA ?? comentario.id, username: comentario.autor.username })
    // Todas las respuestas quedan en un solo hilo: al responder a una respuesta se menciona a su autor.
    const mencion = `@${comentario.autor.username} `
    if (comentario.respuestaA && !texto.startsWith(mencion)) onTexto((mencion + texto).slice(0, MAX_COMENTARIO))
    campo.current?.focus()
  }

  async function enviar(contenido) {
    try {
      const { comentario, comentariosCount } = await comentar(video.id, contenido, respondiendoA?.id)
      if (comentario.respuestaA) {
        respuestas.agregar(comentario.respuestaA, comentario)
        lista.actualizarItem(comentario.respuestaA, (raiz) => ({ respuestasCount: raiz.respuestasCount + 1 }))
      } else {
        lista.agregarAlInicio(comentario)
      }
      setRespondiendoA(null)
      onConteo?.(comentariosCount)
      return true
    } catch (fallo) {
      toast.error(fallo.message)
      return false
    }
  }

  /** Quien reporta un comentario deja de verlo (y si es principal, también su hilo). */
  function ocultar(comentario) {
    if (comentario.respuestaA) respuestas.quitar(comentario.respuestaA, comentario.id)
    else lista.quitarItem(comentario.id)
    if (respondiendoA?.id === comentario.id || respondiendoA?.raizId === comentario.id) setRespondiendoA(null)
  }

  async function eliminar(comentario) {
    try {
      const { comentariosCount } = await eliminarComentario(comentario.id)
      if (comentario.respuestaA) {
        respuestas.quitar(comentario.respuestaA, comentario.id)
        lista.actualizarItem(comentario.respuestaA, (raiz) => ({ respuestasCount: Math.max(0, raiz.respuestasCount - 1) }))
      } else {
        lista.quitarItem(comentario.id)
      }
      if (respondiendoA?.id === comentario.id || respondiendoA?.raizId === comentario.id) setRespondiendoA(null)
      onConteo?.(comentariosCount)
    } catch (fallo) {
      toast.error(fallo.message)
    }
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {lista.items.map((comentario) => (
          <ComentarioItem
            key={comentario.id}
            comentario={comentario}
            esDelCreador={comentario.autor.id === video.autor.id}
            onActualizar={(cambios) => lista.actualizarItem(comentario.id, cambios)}
            onResponder={responder}
            onEliminar={eliminar}
            onReportar={setReportando}
          >
            <RespuestasComentario
              raiz={comentario}
              hilo={respuestas.hilo(comentario.id)}
              autorVideoId={video.autor.id}
              onAlternar={() => respuestas.alternar(comentario.id)}
              onCargarMas={() => respuestas.cargarMas(comentario.id)}
              onActualizar={(id, cambios) => respuestas.actualizar(comentario.id, id, cambios)}
              onResponder={responder}
              onEliminar={eliminar}
              onReportar={setReportando}
            />
          </ComentarioItem>
        ))}

        {lista.cargando && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {!lista.cargando && lista.error && (
          <div className="py-6 text-center text-body-sm text-error">
            {lista.error}{' '}
            <button type="button" onClick={lista.cargarMas} className="font-bold underline">
              Reintentar
            </button>
          </div>
        )}
        {!lista.cargando && !lista.error && lista.items.length === 0 && (
          <EstadoVacio icono="chat_bubble" titulo="Sin comentarios aún" mensaje="Sé la primera persona en proyectar una idea." compacto />
        )}
        {!lista.cargando && lista.hayMas && lista.items.length > 0 && (
          <button
            type="button"
            onClick={lista.cargarMas}
            className="w-full rounded-xl py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
          >
            Ver más comentarios
          </button>
        )}
      </div>

      <CampoComentario
        ref={campo}
        idCampo={idCampo}
        texto={texto}
        onTexto={onTexto}
        respondiendoA={respondiendoA}
        onCancelarRespuesta={() => setRespondiendoA(null)}
        onEnviar={enviar}
      />
      <ModalReporte
        objetivo={reportando && { tipo: 'comentario', id: reportando.id, titulo: 'Reportar comentario' }}
        onCerrar={() => setReportando(null)}
        onReportado={() => {
          ocultar(reportando)
          setReportando(null)
        }}
      />
    </>
  )
}

/**
 * Comentarios de una proyectada. Vuelve a montarlo con key={video.id} al cambiar de video.
 * `video` necesita { id, comentariosCount, autor: { id } }.
 * `plano` quita el fondo de tarjeta (para usarlo dentro de una ventana modal).
 */
export default function PanelComentarios({ video, onConteo, idCampo, plano = false, className = '' }) {
  const [orden, setOrden] = useState('votados')
  // El texto vive aquí para no perderlo al cambiar el orden (la lista se vuelve a montar).
  const [texto, setTexto] = useState('')

  return (
    <div
      className={`flex min-h-0 flex-col p-5 md:p-6 ${plano ? '' : 'rounded-3xl bg-surface-container-low shadow-xl'} ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Icono nombre="forum" className="text-xl text-primary" />
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Comentarios</h2>
          <span className="rounded-full bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {formatearNumero(video.comentariosCount)}
          </span>
        </div>
        <SelectorOrden valor={orden} onCambiar={setOrden} />
      </div>

      <HiloComentarios
        key={orden}
        video={video}
        orden={orden}
        texto={texto}
        onTexto={setTexto}
        onConteo={onConteo}
        idCampo={idCampo}
      />
    </div>
  )
}
