import { Link } from 'react-router'
import PaginaInformativa, { Seccion } from '../components/info/PaginaInformativa'
import { MAX_COMENTARIO } from '../utils/comentarios'
import { LIMITE_IMAGEN_MB, LIMITE_VIDEO_MB, MAX_DESCRIPCION } from '../utils/subida'

/** Términos de Servicio: reglas para usar PROYECTADAS y publicar contenido. */
export default function Terminos() {
  return (
    <PaginaInformativa
      etiqueta="Reglas de la comunidad"
      titulo="Términos de Servicio"
      descripcion="Al crear una cuenta y usar PROYECTADAS aceptas estas reglas. Están pensadas para que la comunidad sea un buen lugar para crear."
      actualizado="5 de octubre de 2026"
    >
      <Seccion icono="person" titulo="Tu cuenta">
        <ul>
          <li>Debes tener la edad mínima que exija la ley de tu país para usar redes sociales.</li>
          <li>Usa datos reales y un nombre de usuario que no se haga pasar por otra persona o marca.</li>
          <li>Cuida tu contraseña: eres responsable de lo que se haga con tu cuenta.</li>
        </ul>
      </Seccion>

      <Seccion icono="movie" titulo="Tu contenido">
        <ul>
          <li>
            Lo que publicas sigue siendo tuyo. Al publicarlo autorizas a PROYECTADAS a guardarlo y mostrarlo en el feed, en
            tu perfil y en los enlaces que se compartan.
          </li>
          <li>Solo publica videos, música e imágenes que sean tuyos o que tengas permiso de usar.</li>
          <li>Tus borradores son privados hasta que decidas publicarlos.</li>
        </ul>
      </Seccion>

      <Seccion icono="block" titulo="Qué no está permitido">
        <ul>
          <li>Contenido sexual que involucre a menores, de cualquier tipo.</li>
          <li>Violencia gráfica, amenazas, acoso o discursos de odio.</li>
          <li>Actividades ilegales, estafas o suplantación de identidad.</li>
          <li>Spam: publicaciones repetidas o vacías para inflar la racha, o comentarios masivos.</li>
          <li>Publicar datos personales de otras personas sin su permiso.</li>
        </ul>
        <p>El contenido que incumpla estas reglas puede retirarse y la cuenta puede suspenderse.</p>
      </Seccion>

      <Seccion icono="forum" titulo="Comentarios">
        <p>
          Comenta con respeto. Quien creó una proyectada puede eliminar cualquier comentario en ella; al hacerlo también se
          eliminan sus respuestas. Tú puedes eliminar tus propios comentarios cuando quieras.
        </p>
      </Seccion>

      <Seccion icono="military_tech" titulo="Insignias y rachas">
        <p>
          Las insignias reconocen tu constancia dentro de la plataforma: no tienen valor monetario ni se pueden transferir.
          Se ganan y se pierden según las reglas de la racha que se explican en{' '}
          <Link to="/insignias">Insignias y Creadores</Link>.
        </p>
      </Seccion>

      <Seccion icono="straighten" titulo="Límites de publicación">
        <ul>
          <li>Videos MP4, WEBM o MOV de hasta {LIMITE_VIDEO_MB} MB (formato vertical 9:16 recomendado).</li>
          <li>Portadas JPG, PNG o WEBP de hasta {LIMITE_IMAGEN_MB} MB.</li>
          <li>
            Descripciones de hasta {MAX_DESCRIPCION} caracteres y comentarios de hasta {MAX_COMENTARIO}.
          </li>
        </ul>
      </Seccion>

      <Seccion icono="update" titulo="Disponibilidad y cambios">
        <p>
          PROYECTADAS se ofrece tal como está y puede cambiar o interrumpirse para mantenimiento. Si estos términos cambian,
          se actualizará la fecha de arriba; seguir usando la plataforma después de un cambio significa que lo aceptas.
        </p>
      </Seccion>
    </PaginaInformativa>
  )
}
