import { useRef, useState } from 'react'
import { useClicFuera } from '../../hooks/useClicFuera'
import { useToast } from '../../hooks/useToast'
import { copiarAlPortapapeles, enlaceVideo } from '../../utils/enlaces'
import { capitalizar, formatearNumero, tiempoRelativo } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import Icono from '../ui/Icono'
import MiniaturaVideo from './MiniaturaVideo'

const claseOpcion =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface'

function MenuOpciones({ opciones }) {
  const [abierto, setAbierto] = useState(false)
  const menu = useRef(null)
  useClicFuera(menu, () => setAbierto(false), abierto)

  return (
    <div ref={menu} className="absolute top-2.5 right-2.5">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label="Opciones de la proyectada"
        aria-expanded={abierto}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface backdrop-blur-md transition-colors hover:text-primary"
      >
        <Icono nombre="more_vert" className="text-lg" />
      </button>
      {abierto && (
        <div className="absolute top-full right-0 z-20 mt-2 w-52 animate-aparecer rounded-2xl bg-surface-container-high p-1.5 shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40">
          {opciones.filter(Boolean).map(({ icono, texto, accion, peligro }) => (
            <button
              key={texto}
              type="button"
              onClick={() => {
                setAbierto(false)
                accion()
              }}
              className={`${claseOpcion} ${peligro ? 'hover:text-error' : ''}`}
            >
              <Icono nombre={icono} className="text-xl" /> {texto}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Borrador en "Mis Proyectadas": portada atenuada y "Continuar Edición" (diseño de STITCH). */
function TarjetaBorrador({ video, onEditar, onEliminar }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-md transition-all hover:bg-surface-container">
      <div className="relative aspect-[9/14] w-full overflow-hidden bg-surface-container-highest">
        <button type="button" onClick={onEditar} aria-label="Continuar edición del borrador" className="absolute inset-0">
          <span className="absolute inset-0 opacity-80 transition-transform duration-500 group-hover:scale-105">
            <MiniaturaVideo video={video} />
          </span>
          <span className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100">
            <span className="flex items-center gap-1 rounded-full bg-primary-container px-space-md py-2 font-label-md text-label-md font-bold text-on-primary-container shadow-lg">
              <Icono nombre="edit" className="text-base" /> Continuar Edición
            </span>
          </span>
        </button>

        <span className="pointer-events-none absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-surface-container-highest/90 px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-surface backdrop-blur-md">
          <Icono nombre="edit_note" className="text-xs text-primary" /> BORRADOR
        </span>

        <MenuOpciones
          opciones={[
            { icono: 'edit', texto: 'Continuar edición', accion: onEditar },
            onEliminar && { icono: 'delete', texto: 'Eliminar borrador', accion: onEliminar, peligro: true },
          ]}
        />
      </div>

      <div className="flex flex-col gap-space-xs p-space-sm">
        <button
          type="button"
          onClick={onEditar}
          className="w-full truncate text-left font-title-md text-title-md text-on-surface transition-colors group-hover:text-primary"
        >
          {video.descripcion || 'Borrador sin descripción'}
        </button>
        <div className="flex items-center justify-between gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <span className="truncate">Guardado {tiempoRelativo(video.actualizadoEn)}</span>
          <span className="shrink-0 text-outline">Sin publicar</span>
        </div>
      </div>
    </article>
  )
}

/** Tarjeta de "Mis Proyectadas": estado, estadísticas, menú de opciones y título debajo. */
export default function TarjetaVideoEstudio({ video, onAbrir, onEditar, onEliminar }) {
  const toast = useToast()
  const estilo = ESTILOS_INSIGNIA[video.nivelInsignia]

  if (video.estado === 'borrador') return <TarjetaBorrador video={video} onEditar={onEditar} onEliminar={onEliminar} />

  async function copiarEnlace() {
    if (await copiarAlPortapapeles(enlaceVideo(video))) toast.exito('Enlace copiado')
    else toast.error('No se pudo copiar el enlace')
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-md transition-all hover:bg-surface-container">
      <div className="relative aspect-[9/14] w-full overflow-hidden bg-surface-container-highest">
        <button type="button" onClick={onAbrir} aria-label="Ver proyectada" className="absolute inset-0">
          <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <MiniaturaVideo video={video} />
          </span>
          <span className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
        </button>

        <span className="pointer-events-none absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-tertiary-container/90 px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary" /> PUBLICADA
        </span>

        <MenuOpciones
          opciones={[
            { icono: 'play_circle', texto: 'Ver proyectada', accion: onAbrir },
            { icono: 'link', texto: 'Copiar enlace', accion: copiarEnlace },
            onEliminar && { icono: 'delete', texto: 'Eliminar', accion: onEliminar, peligro: true },
          ]}
        />

        <span className="pointer-events-none absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface">
          <span className="flex items-center gap-1 drop-shadow-sm">
            <Icono nombre="visibility" className="text-sm text-secondary" /> {formatearNumero(video.vistas)}
          </span>
          <span className="flex items-center gap-1 drop-shadow-sm">
            <Icono nombre="favorite" className="text-sm text-error" /> {formatearNumero(video.likesCount)}
          </span>
          <span className="flex items-center gap-1 drop-shadow-sm">
            <Icono nombre="chat_bubble" className="text-sm text-primary" /> {formatearNumero(video.comentariosCount)}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-space-xs p-space-sm">
        <button
          type="button"
          onClick={onAbrir}
          className="w-full truncate text-left font-title-md text-title-md text-on-surface transition-colors group-hover:text-primary"
        >
          {video.descripcion || 'Proyectada sin descripción'}
        </button>
        <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>{capitalizar(tiempoRelativo(video.publicadoEn))}</span>
          {estilo && (
            <span className={`flex items-center gap-1 font-semibold ${estilo.claseTexto}`}>
              <IconoInsignia nivel={video.nivelInsignia} tamano={12} brillo={false} /> {estilo.nombre}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
