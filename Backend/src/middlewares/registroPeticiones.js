import logger from '../utils/logger.js';

/** Registra método, ruta, código y duración de cada petición a la API. */
export function registrarPeticiones(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}
