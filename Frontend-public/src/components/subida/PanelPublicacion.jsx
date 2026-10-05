import { formatearDuracion } from '../../utils/formato'
import { MAX_DESCRIPCION } from '../../utils/subida'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'
import VistaPreviaSubida from './VistaPreviaSubida'

const ETIQUETAS_RAPIDAS = ['#Cinematic', '#TrendStream', '#ProyectadaVIP', '#Proyectadas']
const claseSecundario =
  'flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-surface-container-high px-space-md py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-40'

function Marca() {
  return (
    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
      ✓
    </span>
  )
}

function textoProgreso(accion, progreso) {
  if (accion === 'borrador') return progreso < 100 ? 'Subiendo tu borrador...' : 'Guardando borrador...'
  return progreso < 100 ? 'Subiendo tu proyectada...' : 'Publicando en el feed...'
}

/** "Panel de Edición & Publicación": vista previa, descripción, portada, publicar o guardar como borrador. */
export default function PanelPublicacion({ ref, subida, usuario, onCambiarPortada, className = '' }) {
  const { archivo, borrador, analisis, analizando, listo, fotogramas, portada, portadaPersonal, descripcion, progreso, accion, subiendo } =
    subida
  const portadaUrl = portada === 'personal' ? portadaPersonal?.url : fotogramas[portada]?.url
  const tiempoPortada = portada === 'personal' ? null : fotogramas[portada]?.tiempo
  const portadaGuardada = Boolean(portadaPersonal && !portadaPersonal.file)
  const publicando = subiendo && accion === 'publicar'

  let textoPortada = 'Carátula: se elige al cargar el video'
  if (portada === 'personal') textoPortada = portadaGuardada ? 'Carátula: la que guardaste' : 'Carátula: imagen personalizada'
  else if (tiempoPortada != null) textoPortada = `Carátula: fotograma ${formatearDuracion(tiempoPortada)}`

  return (
    <div
      ref={ref}
      className={`relative flex scroll-mt-24 flex-col gap-space-lg overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-label-sm font-bold text-on-primary-container">
            1
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Panel de Edición &amp; Publicación</h2>
        </div>
        {archivo ? (
          <div className="flex max-w-full min-w-0 items-center gap-space-xs">
            {borrador ? (
              <span className="flex min-w-0 items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface">
                <Icono nombre="edit_note" className="text-xs text-primary" />
                <span className="truncate">Editando borrador</span>
              </span>
            ) : (
              <span className="flex min-w-0 items-center gap-1 rounded-full bg-tertiary-container/20 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-tertiary">
                <Icono nombre="check_circle" className="text-xs" />
                <span className="truncate">Archivo cargado ({archivo.nombre})</span>
              </span>
            )}
            <button
              type="button"
              onClick={subida.descartar}
              disabled={subiendo}
              title={borrador ? 'Cerrar sin guardar los cambios (el borrador se conserva)' : 'Quitar este video'}
              className="flex shrink-0 items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-40"
            >
              <Icono nombre={borrador ? 'close' : 'delete'} className="text-xs" />
              {borrador ? 'Cerrar' : 'Descartar'}
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 font-label-sm text-label-sm font-semibold text-outline">
            <Icono nombre="hourglass_empty" className="text-xs" /> Esperando un video
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-space-lg md:grid-cols-12">
        <div className="flex flex-col gap-space-sm md:col-span-5">
          <span className="font-label-md text-label-md font-semibold text-on-surface">Vista previa vertical (9:16)</span>
          <VistaPreviaSubida
            key={archivo?.url ?? 'sin-archivo'}
            archivo={archivo}
            analisis={analisis}
            portadaUrl={portadaUrl}
            descripcion={descripcion}
            usuario={usuario}
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">{textoPortada}</span>
            <button
              type="button"
              onClick={onCambiarPortada}
              disabled={!archivo || subiendo}
              className="flex shrink-0 items-center gap-1 font-label-sm text-label-sm font-semibold text-primary transition-colors hover:text-primary-fixed disabled:opacity-40"
            >
              <Icono nombre="edit" className="text-sm" /> Cambiar portada
            </button>
          </div>
        </div>

        <div className="@container flex flex-col gap-space-md md:col-span-7">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <label htmlFor="descripcion-proyectada" className="font-label-md text-label-md font-semibold text-on-surface">
                Descripción de tu Proyectada
              </label>
              <span className="font-label-sm text-label-sm text-outline">
                {descripcion.length} / {MAX_DESCRIPCION}
              </span>
            </div>
            <textarea
              id="descripcion-proyectada"
              value={descripcion}
              onChange={(evento) => subida.setDescripcion(evento.target.value)}
              maxLength={MAX_DESCRIPCION}
              rows={4}
              disabled={subiendo}
              placeholder="Escribe un título cautivador y añade etiquetas con #tendencias..."
              className="w-full resize-none rounded-xl bg-surface-container-high p-space-sm font-body-md text-body-md text-on-surface shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-colors placeholder:text-outline focus:bg-surface-container-highest focus:outline-none disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center gap-space-xs pt-1">
              {ETIQUETAS_RAPIDAS.map((etiqueta) => (
                <button
                  key={etiqueta}
                  type="button"
                  onClick={() => subida.agregarEtiqueta(etiqueta)}
                  disabled={subiendo}
                  className="rounded-full bg-surface-container-highest px-2.5 py-1 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-50"
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Selector de Portada / Miniatura</span>
            <div className="grid grid-cols-4 gap-space-xs">
              {[0, 1, 2].map((indice) => {
                const fotograma = fotogramas[indice]
                if (!fotograma) {
                  return (
                    <div key={indice} className="flex aspect-[9/16] items-center justify-center rounded-lg bg-surface-container-high">
                      {analizando ? <Spinner tamano={16} /> : <Icono nombre="image" className="text-lg text-outline" />}
                    </div>
                  )
                }
                const elegido = portada === indice
                return (
                  <button
                    key={indice}
                    type="button"
                    onClick={() => subida.elegirPortada(indice)}
                    disabled={subiendo}
                    aria-pressed={elegido}
                    aria-label={`Usar el fotograma ${formatearDuracion(fotograma.tiempo)} como portada`}
                    className={`relative aspect-[9/16] overflow-hidden rounded-lg bg-cover bg-center shadow-md transition-opacity ${
                      elegido ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundImage: `url(${fotograma.url})` }}
                  >
                    {elegido && <Marca />}
                  </button>
                )
              })}
              {portadaPersonal ? (
                <button
                  type="button"
                  onClick={() => subida.elegirPortada('personal')}
                  disabled={subiendo}
                  aria-pressed={portada === 'personal'}
                  aria-label={portadaGuardada ? 'Usar la portada guardada' : 'Usar mi imagen como portada'}
                  className={`relative aspect-[9/16] overflow-hidden rounded-lg bg-cover bg-center shadow-md transition-opacity ${
                    portada === 'personal' ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundImage: `url(${portadaPersonal.url})` }}
                >
                  {portada === 'personal' && <Marca />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCambiarPortada}
                  disabled={!archivo || subiendo}
                  className="flex aspect-[9/16] flex-col items-center justify-center rounded-lg bg-surface-container-highest p-1 text-center transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icono nombre="add_photo_alternate" className="text-lg text-primary" />
                  <span className="mt-1 font-label-sm text-[10px] leading-3 text-on-surface-variant">Subir custom</span>
                </button>
              )}
            </div>
          </div>

          {subiendo && (
            <div className="flex flex-col gap-space-xs pt-space-xs" role="status">
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5 font-semibold text-tertiary">
                  <span className="h-2 w-2 animate-ping rounded-full bg-tertiary" />
                  {textoProgreso(accion, progreso)}
                </span>
                <span className="font-bold text-on-surface tabular-nums">{progreso}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary shadow-[0_0_12px_rgba(78,222,163,0.5)] transition-[width] duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col-reverse gap-space-sm pt-space-sm @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-space-md">
            {subiendo ? (
              <button type="button" onClick={subida.cancelar} className={claseSecundario}>
                <Icono nombre="close" className="text-base" />
                {accion === 'borrador' ? 'Cancelar guardado' : 'Cancelar subida'}
              </button>
            ) : (
              <button type="button" onClick={subida.guardarBorrador} disabled={!listo} className={claseSecundario}>
                <Icono nombre="bookmark_border" className="text-base" />
                {borrador ? 'Guardar borrador' : 'Guardar como Borrador'}
              </button>
            )}
            <button
              type="button"
              onClick={subida.publicar}
              disabled={!listo || subiendo}
              className="flex w-full items-center justify-center gap-space-xs rounded-full bg-gradient-to-r from-primary-container via-inverse-primary to-primary px-space-md py-3 font-headline-sm text-title-md font-bold whitespace-nowrap text-on-primary shadow-[0_0_28px_rgba(160,120,255,0.65)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(208,188,255,0.85)] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:shadow-none @sm:text-headline-sm @lg:max-w-sm @lg:flex-1"
            >
              <Icono
                nombre={publicando ? 'sync' : 'rocket_launch'}
                className={`text-2xl drop-shadow-[0_0_8px_#ffffff] ${publicando ? 'animate-spin' : ''}`}
              />
              <span>{publicando ? 'Publicando...' : 'Publicar Proyectada'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
