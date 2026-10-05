import { Link } from 'react-router'
import PaginaInformativa, { Seccion } from '../components/info/PaginaInformativa'

/** Privacidad: qué datos guarda PROYECTADAS, quién los ve y cómo se borran. */
export default function Privacidad() {
  return (
    <PaginaInformativa
      etiqueta="Tus datos"
      titulo="Privacidad"
      descripcion="Qué información guarda PROYECTADAS, qué ven las demás personas y cómo puedes borrarla."
      actualizado="5 de octubre de 2026"
    >
      <Seccion icono="database" titulo="Qué guardamos">
        <ul>
          <li>
            <strong>Cuenta:</strong> nombre, nombre de usuario, correo y contraseña. La contraseña se guarda cifrada; nadie
            puede leerla, ni siquiera quien administra la plataforma.
          </li>
          <li>
            <strong>Perfil:</strong> biografía y foto de perfil.
          </li>
          <li>
            <strong>Tu contenido:</strong> videos, portadas, descripciones con sus #hashtags, borradores, comentarios y
            respuestas.
          </li>
          <li>
            <strong>Actividad:</strong> a quién sigues, tus me gusta (a proyectadas y a comentarios), tus Favoritos y tus
            notificaciones. Las reproducciones solo suman al contador del video: no se guarda quién vio qué.
          </li>
          <li>
            <strong>Insignia:</strong> el progreso de tu racha, cuándo publicaste por última vez y las vidas que usaste en el
            mes.
          </li>
        </ul>
      </Seccion>

      <Seccion icono="visibility" titulo="Qué ven las demás personas">
        <p>
          Cualquier persona con cuenta puede ver tu nombre, usuario, foto, biografía, tu insignia y el estado de tu racha,
          tus seguidores y seguidos, tus proyectadas publicadas (con sus me gusta y comentarios) y los comentarios que
          escribes.
        </p>
        <p>
          <strong>Solo tú ves</strong> tu correo, tus borradores, tus Favoritos, la lista de proyectadas a las que diste me
          gusta y tus notificaciones.
        </p>
      </Seccion>

      <Seccion icono="tune" titulo="Para qué se usan">
        <ul>
          <li>Mostrar tu perfil y armar el feed (Tendencias ordena por interacción y antigüedad).</li>
          <li>Calcular tu racha y tu insignia, y avisarte cuando tu racha está por vencer.</li>
          <li>Avisarte de nuevos seguidores, me gusta, comentarios y respuestas.</li>
        </ul>
        <p>PROYECTADAS no muestra publicidad ni envía tus datos a servicios de análisis o de marketing.</p>
      </Seccion>

      <Seccion icono="language" titulo="Servicios externos y tu navegador">
        <p>
          Las tipografías y los íconos se cargan desde Google Fonts, así que tu navegador se conecta a los servidores de
          Google para descargarlos.
        </p>
        <p>
          Al iniciar sesión se guarda un token en el almacenamiento local de tu navegador para mantenerte conectado; vence a
          los pocos días (7 por defecto) y se borra al cerrar sesión. No usamos cookies.
        </p>
      </Seccion>

      <Seccion icono="delete_sweep" titulo="Cuánto tiempo se conservan y cómo borrarlos">
        <ul>
          <li>Tu contenido se conserva mientras no lo borres.</li>
          <li>
            Al eliminar una proyectada se borran el video, su portada, sus me gusta, sus comentarios y las notificaciones
            relacionadas. Al eliminar un comentario se borran también sus respuestas.
          </li>
          <li>Las notificaciones se borran solas a los 90 días.</li>
          <li>Puedes cambiar tu nombre, biografía y foto cuando quieras desde Editar perfil.</li>
        </ul>
        <p>
          Para eliminar tu cuenta por completo, contacta al equipo de PROYECTADAS desde <Link to="/soporte">Soporte</Link>.
        </p>
      </Seccion>
    </PaginaInformativa>
  )
}
