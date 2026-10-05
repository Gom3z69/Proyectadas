import { Link } from 'react-router'
import { formatearNumero } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import InsigniaChip from '../insignias/InsigniaChip'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'

function Estadistica({ valor, etiqueta, color, onClick }) {
  const clase = 'flex min-w-24 flex-col items-center justify-center rounded-lg bg-surface-container-low p-space-sm text-center shadow-sm md:p-space-md'
  const contenido = (
    <>
      <span className={`font-headline-sm text-headline-sm font-extrabold ${color}`}>{formatearNumero(valor)}</span>
      <span className="mt-0.5 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">{etiqueta}</span>
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={`${clase} transition-colors hover:bg-surface-container-high`}>
      {contenido}
    </button>
  ) : (
    <div className={clase}>{contenido}</div>
  )
}

/** Tarjeta principal de "Mi Perfil": foto, nombre, biografía, acciones y estadísticas. */
export default function CabeceraPerfil({ perfil, onEditar, onVerRelaciones, onCompartir }) {
  const { estadisticas, insignia } = perfil
  const estilo = ESTILOS_INSIGNIA[insignia.nivel]

  return (
    <section className="relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-xl md:p-space-lg lg:p-space-xl">
      <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-space-lg lg:flex-row lg:items-start">
        <div className="flex flex-col items-center gap-space-lg text-center sm:flex-row sm:items-start sm:text-left">
          <div className="group relative shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary via-secondary to-tertiary opacity-90 blur-md transition-all duration-500 group-hover:opacity-100 group-hover:blur-lg" />
            <div className="relative rounded-full bg-surface-container-lowest p-1">
              <Avatar usuario={perfil} tamano={136} />
            </div>
            {estilo && (
              <div
                className="absolute right-2 bottom-1 flex items-center justify-center rounded-full bg-surface-container-highest p-2 shadow-md"
                title={`Nivel actual: ${estilo.nombre}`}
              >
                <IconoInsignia nivel={insignia.nivel} tamano={20} apagada={insignia.estado === 'apagada'} />
              </div>
            )}
          </div>

          <div className="flex max-w-xl min-w-0 flex-col gap-space-xs">
            <div className="flex flex-wrap items-center justify-center gap-space-sm sm:justify-start">
              <h1 className="font-headline-md text-headline-md font-extrabold tracking-tight break-words text-on-surface">
                {perfil.nombre}
              </h1>
              <InsigniaChip insignia={insignia} />
            </div>
            <p className="font-label-md text-label-md font-semibold text-secondary">@{perfil.username}</p>
            <p className="mt-1 font-body-md text-body-md leading-relaxed break-words whitespace-pre-line text-on-surface-variant">
              {perfil.bio || <span className="italic">Aún no escribes tu biografía. Cuéntale al mundo qué proyectas.</span>}
            </p>
            <div className="mt-space-sm flex flex-wrap items-center justify-center gap-space-sm sm:justify-start">
              <Link
                to="/mis-proyectadas"
                className="flex items-center gap-1.5 rounded-full bg-primary-container px-5 py-2 font-label-md text-label-md font-bold text-on-primary-container shadow-md transition-all hover:brightness-110 active:scale-95"
              >
                <Icono nombre="movie_filter" className="text-base" /> Nueva Proyectada
              </Link>
              <button
                type="button"
                onClick={onEditar}
                className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-2 font-label-md text-label-md font-medium text-on-surface transition-all hover:bg-surface-bright active:scale-95"
              >
                <Icono nombre="edit" className="text-base" /> Editar Perfil
              </button>
              <button
                type="button"
                onClick={onCompartir}
                aria-label="Compartir perfil"
                title="Compartir perfil"
                className="flex items-center justify-center rounded-full bg-surface-container-high p-2 text-on-surface transition-all hover:bg-surface-bright active:scale-95"
              >
                <Icono nombre="share" className="text-base" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid w-full shrink-0 grid-cols-2 gap-space-sm sm:grid-cols-4 lg:w-auto lg:grid-cols-2">
          <Estadistica valor={estadisticas.likes} etiqueta="Me gusta" color="text-primary" />
          <Estadistica
            valor={estadisticas.seguidores}
            etiqueta="Seguidores"
            color="text-secondary"
            onClick={() => onVerRelaciones('seguidores')}
          />
          <Estadistica
            valor={estadisticas.seguidos}
            etiqueta="Seguidos"
            color="text-on-surface"
            onClick={() => onVerRelaciones('seguidos')}
          />
          <Estadistica valor={estadisticas.videos} etiqueta="Videos" color="text-tertiary" />
        </div>
      </div>
    </section>
  )
}
