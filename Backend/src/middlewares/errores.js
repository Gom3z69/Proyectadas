import mongoose from 'mongoose';
import multer from 'multer';
import { LIMITES_MB } from '../Configs/archivos.js';
import { ApiError } from '../utils/ApiError.js';
import { borrarArchivosDePeticion } from '../utils/archivos.js';
import logger from '../utils/logger.js';

const MENSAJES_MULTER = {
  LIMIT_FILE_SIZE: `El archivo supera el tamaño permitido (videos hasta ${LIMITES_MB.video} MB, imágenes hasta ${LIMITES_MB.imagen} MB)`,
  LIMIT_FILE_COUNT: 'Se enviaron demasiados archivos',
  LIMIT_UNEXPECTED_FILE: 'Se recibió un archivo en un campo no permitido',
  LIMIT_FIELD_COUNT: 'Se enviaron demasiados campos',
};

const CAMPOS_DUPLICADOS = {
  email: 'Ese correo ya está registrado',
  username: 'Ese nombre de usuario ya está en uso',
};

export function rutaNoEncontrada(req, res, next) {
  next(ApiError.noEncontrado(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Express reconoce al manejador de errores por sus 4 parámetros (next es obligatorio aunque no se use).
export function manejarErrores(err, req, res, next) {
  borrarArchivosDePeticion(req);

  let status = err.status ?? err.statusCode ?? 500;
  let mensaje = err.message;
  let detalles = err.detalles;

  if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    mensaje = MENSAJES_MULTER[err.code] ?? 'No se pudo procesar el archivo';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    detalles = Object.values(err.errors).map((error) => error.message);
    mensaje = detalles[0];
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    mensaje = 'Identificador inválido';
  } else if (err.code === 11000) {
    status = 409;
    const campo = Object.keys(err.keyPattern ?? {})[0];
    mensaje = CAMPOS_DUPLICADOS[campo] ?? 'El registro ya existe';
  } else if (err.type === 'entity.parse.failed') {
    mensaje = 'El cuerpo de la petición no es un JSON válido';
  } else if (err.type === 'entity.too.large') {
    mensaje = 'El cuerpo de la petición es demasiado grande';
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${err.stack ?? err.message}`);
    mensaje = 'Ocurrió un error interno en el servidor';
    detalles = undefined;
  }

  res.status(status).json({ error: mensaje, ...(detalles && { detalles }) });
}
