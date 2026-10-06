import rateLimit from 'express-rate-limit';
import config from '../../Config.js';

const opcionesBase = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};

// Frena ataques de fuerza bruta: solo cuentan los intentos fallidos, así varias personas
// en la misma red (p. ej. un salón de clases) pueden iniciar sesión sin bloquearse.
export const limiteLogin = rateLimit({
  ...opcionesBase,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos fallidos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});

export const limiteRegistro = rateLimit({
  ...opcionesBase,
  windowMs: 60 * 60 * 1000,
  limit: 100,
  message: { error: 'Demasiados registros desde esta red. Intenta más tarde.' },
});

// Enlaces de recuperación de contraseña: evita usar el formulario para enviar correos en masa.
export const limiteRecuperacion = rateLimit({
  ...opcionesBase,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en unos minutos.' },
});

const porUsuario = (req) => String(req.usuario._id);

// Cambios que piden la contraseña actual: solo cuentan los intentos con la contraseña equivocada.
export const limiteConfirmacion = rateLimit({
  ...opcionesBase,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: porUsuario,
  message: { error: 'Demasiados intentos con la contraseña equivocada. Espera unos minutos.' },
});

// Reportes: evita usarlos para acosar o saturar al equipo de moderación.
export const limiteReportes = rateLimit({
  ...opcionesBase,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: porUsuario,
  message: { error: 'Enviaste demasiados reportes en poco tiempo. Intenta más tarde.' },
});

// Anti-spam por usuario: subidas de video (publicadas o borradores) y comentarios.
export const limiteSubidas = rateLimit({
  ...opcionesBase,
  windowMs: 60 * 60 * 1000,
  limit: config.limites.subidasPorHora,
  keyGenerator: porUsuario,
  message: { error: 'Subiste demasiadas proyectadas en poco tiempo. Espera un rato antes de subir otra.' },
});

export const limiteComentarios = rateLimit({
  ...opcionesBase,
  windowMs: 10 * 60 * 1000,
  limit: config.limites.comentariosPor10Min,
  keyGenerator: porUsuario,
  message: { error: 'Estás comentando muy rápido. Espera unos minutos antes de seguir.' },
});
