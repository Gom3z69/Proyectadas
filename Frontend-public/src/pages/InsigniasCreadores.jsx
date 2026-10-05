import { Link } from 'react-router'
import PaginaInformativa, { Seccion } from '../components/info/PaginaInformativa'
import IconoInsignia from '../components/insignias/IconoInsignia'
import Icono from '../components/ui/Icono'
import { useAuth } from '../hooks/useAuth'
import { useNivelesInsignia, useReglasRacha } from '../hooks/useNivelesInsignia'
import { ESTILOS_INSIGNIA } from '../utils/insignias'

const FORMAS = { circulo: 'Círculo', diamante: 'Diamante', rombo: 'Rombo', corona: 'Corona' }
const plural = (cantidad, una, varias) => `${cantidad} ${cantidad === 1 ? una : varias}`
const BOTON_PRINCIPAL =
  'flex items-center justify-center gap-space-xs rounded-full bg-gradient-to-r from-primary-container via-inverse-primary to-secondary px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary-fixed shadow-[0_0_24px_rgba(160,120,255,0.45)] transition-all hover:shadow-[0_0_32px_rgba(160,120,255,0.7)]'
const BOTON_SECUNDARIO =
  'flex items-center justify-center gap-space-xs rounded-full bg-surface-container-high px-space-lg py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest'

/** Insignias y Creadores: los niveles y las reglas de la racha, tal como los define el backend. */
export default function InsigniasCreadores() {
  const { usuario } = useAuth()
  const niveles = useNivelesInsignia()
  const reglas = useReglasRacha()
  const vidas = reglas.oportunidadesPorMes
  const cuentaVidas = Array.from({ length: vidas }, (_, indice) => vidas - indice).join(' → ')

  return (
    <PaginaInformativa
      etiqueta="Sistema de insignias"
      titulo="Insignias y Creadores"
      descripcion="Publica con constancia para subir de Bronce a Gran Maestro. Tu insignia aparece a la par de tu nombre en el feed, en tus comentarios y en tu perfil."
    >
      <section aria-labelledby="titulo-niveles" className="rounded-xl bg-surface-container p-space-lg shadow-lg">
        <h2
          id="titulo-niveles"
          className="mb-space-md flex items-center gap-space-xs font-title-md text-title-md font-bold text-on-surface"
        >
          <Icono nombre="trophy" className="text-2xl text-primary" /> Los {niveles.length} niveles
        </h2>
        <ol className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 lg:grid-cols-6">
          {niveles.map((nivel, indice) => {
            const estilo = ESTILOS_INSIGNIA[nivel.clave]
            return (
              <li
                key={nivel.clave}
                className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low p-space-sm text-center transition-colors hover:bg-surface-container-high"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${estilo?.brillo ?? '#ffffff'}22` }}
                >
                  <IconoInsignia nivel={nivel.clave} tamano={40} />
                </span>
                <span className={`font-title-md text-title-md font-bold ${estilo?.claseTexto ?? 'text-on-surface'}`}>
                  {nivel.nombre}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Nivel {indice + 1} · {FORMAS[nivel.forma]}
                </span>
                <span className="rounded-full bg-surface-container-highest px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface">
                  Desde {plural(nivel.minimo, 'proyectada', 'proyectadas')}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="mt-space-sm font-body-sm text-body-sm text-outline">Se cuentan las proyectadas publicadas en tu racha actual.</p>
      </section>

      <Seccion icono="local_fire_department" titulo="Cómo funciona la racha">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Publica al menos una proyectada cada <strong>{reglas.horasParaPublicar} horas</strong> para mantener tu insignia
            encendida.
          </li>
          <li>
            Si pasan {reglas.horasParaPublicar} horas sin publicar, tu insignia <strong>se apaga</strong> y tienes{' '}
            {reglas.horasParaRevivir} horas más para revivirla: con el botón <strong>Revivir</strong> o publicando.
          </li>
          <li>
            Cada vez que la revives usas una vida. Tienes <strong>{plural(vidas, 'vida', 'vidas')} al mes</strong> (
            {cuentaVidas}) y se reinician cada 1° de mes.
          </li>
          <li>
            Si se apaga cuando ya no te quedan vidas, o no la revives a tiempo, <strong>la pierdes</strong> y tu progreso
            vuelve a 0.
          </li>
        </ol>
      </Seccion>

      <Seccion icono="trending_up" titulo="Qué suma a tu progreso">
        <ul>
          <li>Cada proyectada que publicas suma 1 a tu racha.</li>
          <li>Los borradores no cuentan hasta que los publicas.</li>
          <li>Si eliminas una proyectada de tu racha actual, tu progreso baja en 1.</li>
          <li>Cada proyectada guarda la insignia con la que la publicaste; la verás en sus tarjetas de tu perfil.</li>
        </ul>
      </Seccion>

      <Seccion icono="workspace_premium" titulo="Para creadores">
        <ul>
          <li>Tu insignia se muestra a la par de tu nombre; si está apagada, se ve atenuada hasta que la revivas.</li>
          <li>
            El feed <strong>Élite Gran Maestro</strong> reúne las proyectadas de quienes tienen la insignia Gran Maestro vigente.
          </li>
          <li>La campana te avisa cuando faltan pocas horas para que venza tu racha y cuando tu insignia se apaga.</li>
        </ul>
      </Seccion>

      <div className="flex flex-col gap-space-sm sm:flex-row">
        {usuario ? (
          <>
            <Link to="/mis-proyectadas" className={BOTON_PRINCIPAL}>
              <Icono nombre="cloud_upload" className="text-lg" /> Subir Proyectada
            </Link>
            <Link to="/perfil" className={BOTON_SECUNDARIO}>
              <Icono nombre="route" className="text-lg" /> Ver mi Camino de Insignias
            </Link>
          </>
        ) : (
          <Link to="/registro" className={BOTON_PRINCIPAL}>
            <Icono nombre="person_add" className="text-lg" /> Crear cuenta y empezar mi racha
          </Link>
        )}
      </div>
    </PaginaInformativa>
  )
}
