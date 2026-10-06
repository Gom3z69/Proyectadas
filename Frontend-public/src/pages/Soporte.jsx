import { Link } from 'react-router'
import PaginaInformativa from '../components/info/PaginaInformativa'
import Icono from '../components/ui/Icono'
import { useAuth } from '../hooks/useAuth'
import { useReglasRacha } from '../hooks/useNivelesInsignia'
import { LIMITE_IMAGEN_MB, LIMITE_VIDEO_MB } from '../utils/subida'

// Correo de soporte de esta instalación (opcional): VITE_CORREO_SOPORTE en el .env del frontend.
const CORREO_SOPORTE = import.meta.env.VITE_CORREO_SOPORTE?.trim()

function preguntas(reglas) {
  return [
    {
      pregunta: '¿Cómo subo una proyectada?',
      respuesta: (
        <>
          Ve a <Link to="/mis-proyectadas">Mis Proyectadas</Link> y toca <strong>Subir Proyectada</strong>: en el celular abre
          tu galería y en la computadora, el explorador de archivos. Elige la portada, escribe la descripción y toca{' '}
          <strong>Publicar Proyectada</strong>.
        </>
      ),
    },
    {
      pregunta: '¿Para qué sirven los borradores?',
      respuesta: (
        <>
          Con <strong>Guardar como Borrador</strong> subes el video sin publicarlo: solo tú lo ves y no cuenta para tu
          racha. Retómalo con <strong>Continuar Edición</strong> desde Mis Proyectadas o desde la pestaña Borradores de tu
          perfil.
        </>
      ),
    },
    {
      pregunta: 'Mi insignia se apagó, ¿qué hago?',
      respuesta: (
        <>
          Tienes {reglas.horasParaRevivir} horas para revivirla con el botón <strong>Revivir</strong> (en Mis Proyectadas o
          en tu perfil) o publicando una proyectada. Cada reanimación usa una de tus {reglas.oportunidadesPorMes} vidas del
          mes. Más detalles en <Link to="/insignias">Insignias y Creadores</Link>.
        </>
      ),
    },
    {
      pregunta: '¿Cuándo recupero mis vidas?',
      respuesta: 'Las vidas se reinician cada 1° de mes.',
    },
    {
      pregunta: '¿Por qué no veo mi proyectada en el feed?',
      respuesta: (
        <>
          Revisa que no sea un borrador. En <strong>Siguiendo</strong> solo aparecen las cuentas que sigues, y{' '}
          <strong>Tendencias</strong> ordena por interacción y antigüedad, así que puede aparecer más abajo.
        </>
      ),
    },
    {
      pregunta: '¿Cómo respondo o doy me gusta a un comentario?',
      respuesta: (
        <>
          Debajo de cada comentario están el corazón y <strong>Responder</strong>. Las respuestas quedan en el hilo del
          comentario: toca <strong>Ver respuestas</strong> para abrirlo. Puedes ordenar los comentarios por{' '}
          <strong>Más votados</strong> o <strong>Más recientes</strong>.
        </>
      ),
    },
    {
      pregunta: 'Olvidé mi contraseña, ¿cómo entro?',
      respuesta: (
        <>
          En la pantalla de inicio de sesión toca <strong>¿Olvidaste tu contraseña?</strong> y escribe tu correo: te
          enviaremos un enlace para crear una nueva. Vence en 1 hora y solo sirve una vez; revisa también la carpeta de
          spam.
        </>
      ),
    },
    {
      pregunta: '¿Cómo cambio mi correo o mi contraseña?',
      respuesta: (
        <>
          En <Link to="/configuracion">Configuración</Link> (menú de tu foto). Te pediremos tu contraseña actual; al
          cambiarla se cierra la sesión en tus otros dispositivos.
        </>
      ),
    },
    {
      pregunta: '¿Cómo bloqueo o reporto a alguien?',
      respuesta: (
        <>
          Desde el menú <strong>⋮</strong> de una proyectada, el botón <strong>Reportar</strong> de un comentario o el menú{' '}
          <strong>⋯</strong> de un perfil. Al bloquear, ninguna de las dos cuentas verá a la otra. Lo que reportas deja de
          aparecerte y el equipo de moderación lo revisa. Desbloquea a quien quieras desde Configuración.
        </>
      ),
    },
    {
      pregunta: '¿Cómo elimino mi cuenta?',
      respuesta: (
        <>
          En <Link to="/configuracion">Configuración</Link>, al final, toca <strong>Eliminar mi cuenta</strong> y confirma
          con tu contraseña. Se borra todo tu contenido y no se puede deshacer.
        </>
      ),
    },
    {
      pregunta: '¿Cómo cambio mi foto, nombre o biografía?',
      respuesta: (
        <>
          En <Link to="/perfil">Mi Perfil</Link> toca <strong>Editar Perfil</strong>.
        </>
      ),
    },
    {
      pregunta: '¿Cómo comparto una proyectada?',
      respuesta: 'Toca Compartir en el video: se copia un enlace que abre la proyectada en el perfil de quien la creó.',
    },
    {
      pregunta: '¿Qué notificaciones recibo?',
      respuesta:
        'La campana te avisa de nuevos seguidores, me gusta a tus proyectadas y comentarios, comentarios y respuestas, y también cuando tu racha está por vencer o tu insignia se apagó.',
    },
    {
      pregunta: '¿Qué archivos puedo subir?',
      respuesta: `Videos MP4, WEBM o MOV de hasta ${LIMITE_VIDEO_MB} MB (se recomienda formato vertical 9:16) y portadas JPG, PNG o WEBP de hasta ${LIMITE_IMAGEN_MB} MB.`,
    },
  ]
}

/** Soporte: preguntas frecuentes y contacto. */
export default function Soporte() {
  const { usuario } = useAuth()
  const reglas = useReglasRacha()

  return (
    <PaginaInformativa
      etiqueta="Centro de ayuda"
      titulo="Soporte"
      descripcion="Respuestas rápidas a las dudas más comunes sobre proyectadas, borradores, rachas y comentarios."
    >
      <div className="flex flex-col gap-space-sm">
        {preguntas(reglas).map(({ pregunta, respuesta }) => (
          <details
            key={pregunta}
            className="group rounded-xl bg-surface-container px-space-md py-3 shadow-sm transition-colors open:bg-surface-container-high"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-space-sm font-label-lg text-label-lg font-semibold text-on-surface [&::-webkit-details-marker]:hidden">
              {pregunta}
              <Icono nombre="expand_more" className="text-xl text-on-surface-variant transition-transform group-open:rotate-180" />
            </summary>
            <div className="pt-2 pb-1 font-body-md text-body-md text-on-surface-variant [&_a]:font-semibold [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-on-surface">
              {respuesta}
            </div>
          </details>
        ))}
      </div>

      <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-lg shadow-lg" aria-labelledby="titulo-contacto">
        <h2 id="titulo-contacto" className="flex items-center gap-space-xs font-title-md text-title-md font-bold text-on-surface">
          <Icono nombre="mail" className="text-2xl text-primary" /> ¿Necesitas más ayuda?
        </h2>
        {CORREO_SOPORTE ? (
          <>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Escríbenos y cuéntanos qué pasó{usuario ? ` (incluye tu usuario @${usuario.username})` : ''}; si es sobre una
              proyectada, pega su enlace.
            </p>
            <a
              href={`mailto:${CORREO_SOPORTE}`}
              className="flex items-center justify-center gap-space-xs self-start rounded-full bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary-container transition-shadow hover:shadow-[0_0_24px_rgba(160,120,255,0.5)]"
            >
              <Icono nombre="send" className="text-lg" /> {CORREO_SOPORTE}
            </a>
          </>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant">
            Esta instalación de PROYECTADAS todavía no tiene un correo de soporte configurado.
            {import.meta.env.DEV && (
              <>
                {' '}
                Defínelo en{' '}
                <code className="rounded bg-surface-container-highest px-1.5 py-0.5 text-on-surface">VITE_CORREO_SOPORTE</code>{' '}
                (archivo .env del frontend).
              </>
            )}
          </p>
        )}
      </section>
    </PaginaInformativa>
  )
}
