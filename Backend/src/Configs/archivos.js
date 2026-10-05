import fs from 'node:fs';
import path from 'node:path';
import config from '../../Config.js';

export const CARPETAS = {
  videos: path.join(config.rutas.uploads, 'videos'),
  miniaturas: path.join(config.rutas.uploads, 'miniaturas'),
  avatares: path.join(config.rutas.uploads, 'avatares'),
};

export const LIMITES_MB = {
  video: config.maxVideoMB,
  imagen: 5,
};

// La extensión se decide por el tipo MIME validado, nunca por el nombre original del archivo.
export const TIPOS_VIDEO = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-m4v': '.m4v',
  'video/ogg': '.ogv',
};

export const TIPOS_IMAGEN = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function asegurarCarpetas() {
  for (const carpeta of Object.values(CARPETAS)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }
}
