import Notificacion from '../models/Notificacion.js';
import logger from './logger.js';

// Notificar es secundario: si falla, la acción principal (seguir, dar me gusta, comentar) igual se completa.

/** Avisa a `destinatario` de lo que hizo `actor`. Nunca se notifica a alguien de sus propias acciones. */
export async function notificar({ destinatario, actor, tipo, video = null, comentario = null }) {
  if (!destinatario || String(destinatario) === String(actor)) return;
  try {
    await Notificacion.create({ destinatario, actor, tipo, video, comentario });
  } catch (error) {
    logger.error(`No se pudo crear la notificación "${tipo}": ${error.message}`);
  }
}

/** Retira las notificaciones de una acción que se deshizo o de contenido que se eliminó. */
export async function retirarNotificaciones(filtro) {
  try {
    await Notificacion.deleteMany(filtro);
  } catch (error) {
    logger.error(`No se pudieron retirar notificaciones: ${error.message}`);
  }
}
