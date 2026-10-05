import Icono from '../ui/Icono'
import ReglaVital24h from './ReglaVital24h'
import TrayectoriaRangos from './TrayectoriaRangos'

function NivelActual({ insignia }) {
  const progreso = insignia.siguiente ? `${insignia.progreso}/${insignia.siguiente.minimo}` : `${insignia.progreso}`

  if (insignia.estado === 'apagada') {
    return (
      <Pildora punto="bg-error" color="text-error">
        Insignia apagada: {insignia.nombre} ({progreso})
      </Pildora>
    )
  }
  if (insignia.estado === 'activa') {
    return (
      <Pildora punto="bg-secondary animate-pulse" color="text-secondary">
        Nivel actual: {insignia.nombre} ({progreso})
      </Pildora>
    )
  }
  return (
    <Pildora punto="bg-outline" color="text-on-surface-variant">
      Sin insignia ({progreso})
    </Pildora>
  )
}

function Pildora({ punto, color, children }) {
  return (
    <div
      className={`inline-flex items-center gap-2 self-start rounded-full bg-surface-container px-3 py-1.5 font-label-sm text-label-sm sm:self-auto ${color}`}
    >
      <span className={`h-2 w-2 rounded-full ${punto}`} /> {children}
    </div>
  )
}

/** "Camino de Insignias PROYECTADAS": trayectoria de rangos + regla vital de 24 horas (perfil propio). */
export default function CaminoInsignias({ insignia, esPropio, username, onRevivir, reviviendo, onVencido }) {
  return (
    <section className="flex flex-col gap-space-lg" aria-labelledby="titulo-camino-insignias">
      <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center justify-center rounded-lg bg-primary-container p-2 text-on-primary-container">
            <Icono nombre="military_tech" className="text-xl" />
          </div>
          <div>
            <h2 id="titulo-camino-insignias" className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Camino de Insignias PROYECTADAS
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {esPropio
                ? 'Tu rango sube con cada creación compartida. No dejes caer la racha.'
                : `El rango de @${username} sube con cada proyectada que comparte.`}
            </p>
          </div>
        </div>
        <NivelActual insignia={insignia} />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-space-md lg:grid-cols-12">
        <TrayectoriaRangos insignia={insignia} className="lg:col-span-8" />
        <ReglaVital24h
          insignia={insignia}
          esPropio={esPropio}
          username={username}
          onRevivir={onRevivir}
          reviviendo={reviviendo}
          onVencido={onVencido}
          className="lg:col-span-4"
        />
      </div>
    </section>
  )
}
