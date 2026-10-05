import Modal from '../ui/Modal'
import ListaRelaciones from './ListaRelaciones'

const PESTANAS = [
  { tipo: 'seguidores', texto: 'Seguidores' },
  { tipo: 'seguidos', texto: 'Siguiendo' },
]

/** Ventana con las pestañas Seguidores / Siguiendo. `tipo` null la mantiene cerrada. */
export default function ModalRelaciones({ perfil, tipo, onCambiarTipo, onCerrar }) {
  return (
    <Modal abierto={Boolean(tipo)} onCerrar={onCerrar} titulo={`@${perfil.username}`}>
      <div className="sticky top-0 z-10 flex gap-2 bg-surface-container-low px-6 pt-1 pb-3">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.tipo}
            type="button"
            onClick={() => onCambiarTipo(pestana.tipo)}
            className={`rounded-full px-4 py-2 font-label-md text-label-md transition-all ${
              pestana.tipo === tipo
                ? 'bg-primary-container font-bold text-on-primary-container'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {pestana.texto} · {pestana.tipo === 'seguidores' ? perfil.estadisticas.seguidores : perfil.estadisticas.seguidos}
          </button>
        ))}
      </div>
      <div className="min-h-[40dvh] px-3 pb-6">
        {tipo && <ListaRelaciones key={tipo} username={perfil.username} tipo={tipo} onElegir={onCerrar} />}
      </div>
    </Modal>
  )
}
