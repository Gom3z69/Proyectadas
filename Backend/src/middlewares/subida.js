import crypto from 'node:crypto';
import multer from 'multer';
import { CARPETAS, LIMITES_MB, TIPOS_IMAGEN, TIPOS_VIDEO } from '../Configs/archivos.js';
import { ApiError } from '../utils/ApiError.js';

const MB = 1024 * 1024;

const CAMPOS = {
  video: { carpeta: CARPETAS.videos, tipos: TIPOS_VIDEO, error: 'Formato de video no soportado. Usa MP4, WEBM o MOV.' },
  miniatura: { carpeta: CARPETAS.miniaturas, tipos: TIPOS_IMAGEN, error: 'La miniatura debe ser JPG, PNG o WEBP.' },
  avatar: { carpeta: CARPETAS.avatares, tipos: TIPOS_IMAGEN, error: 'La foto de perfil debe ser JPG, PNG o WEBP.' },
};

const almacenamiento = multer.diskStorage({
  destination: (req, archivo, cb) => cb(null, CAMPOS[archivo.fieldname].carpeta),
  filename: (req, archivo, cb) => {
    const extension = CAMPOS[archivo.fieldname].tipos[archivo.mimetype];
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  },
});

function filtrarArchivo(req, archivo, cb) {
  const campo = CAMPOS[archivo.fieldname];
  if (!campo) return cb(ApiError.solicitudInvalida(`Campo de archivo inesperado: ${archivo.fieldname}`));
  if (!campo.tipos[archivo.mimetype]) return cb(new ApiError(415, campo.error));
  cb(null, true);
}

/** Video + miniatura opcional (generada en el navegador). */
export const subirVideo = multer({
  storage: almacenamiento,
  fileFilter: filtrarArchivo,
  limits: { fileSize: LIMITES_MB.video * MB, files: 2, fields: 10 },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'miniatura', maxCount: 1 },
]);

/** Nueva portada opcional al editar o publicar un borrador. */
export const subirPortada = multer({
  storage: almacenamiento,
  fileFilter: filtrarArchivo,
  limits: { fileSize: LIMITES_MB.imagen * MB, files: 1, fields: 10 },
}).single('miniatura');

export const subirAvatar = multer({
  storage: almacenamiento,
  fileFilter: filtrarArchivo,
  limits: { fileSize: LIMITES_MB.imagen * MB, files: 1, fields: 10 },
}).single('avatar');
