import fs from 'node:fs/promises';
import { ApiError } from '../utils/ApiError.js';

// Comprueba por los primeros bytes (la "firma" del formato) que cada archivo sea lo que dice ser:
// la extensión y el tipo que envía el navegador se pueden falsificar, el contenido no.

const CAJAS_ISO = new Set(['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip', 'pnot']);

function esVideo(inicio) {
  if (CAJAS_ISO.has(inicio.toString('latin1', 4, 8))) return true; // MP4, MOV, M4V (contenedor ISO / QuickTime)
  if (inicio.readUInt32BE(0) === 0x1a45dfa3) return true; // WEBM (EBML / Matroska)
  return inicio.toString('latin1', 0, 4) === 'OggS'; // OGG
}

function esImagen(inicio) {
  if (inicio[0] === 0xff && inicio[1] === 0xd8 && inicio[2] === 0xff) return true; // JPEG
  if (inicio.readUInt32BE(0) === 0x89504e47 && inicio.readUInt32BE(4) === 0x0d0a1a0a) return true; // PNG
  return inicio.toString('latin1', 0, 4) === 'RIFF' && inicio.toString('latin1', 8, 12) === 'WEBP'; // WEBP
}

const VERIFICADORES = {
  video: { valido: esVideo, error: 'El archivo no es un video válido.' },
  miniatura: { valido: esImagen, error: 'La portada no es una imagen válida.' },
  avatar: { valido: esImagen, error: 'La foto de perfil no es una imagen válida.' },
};

async function leerInicio(ruta) {
  const archivo = await fs.open(ruta, 'r');
  try {
    const { buffer, bytesRead } = await archivo.read(Buffer.alloc(16), 0, 16, 0);
    return bytesRead === 16 ? buffer : null;
  } finally {
    await archivo.close();
  }
}

/** Va después de multer: rechaza (415) los archivos cuyo contenido no es un video o una imagen real. */
export async function verificarArchivos(req, res, next) {
  const archivos = [req.file, ...Object.values(req.files ?? {}).flat()].filter(Boolean);
  for (const archivo of archivos) {
    const verificador = VERIFICADORES[archivo.fieldname];
    const inicio = await leerInicio(archivo.path);
    if (!inicio || !verificador.valido(inicio)) throw new ApiError(415, verificador.error);
  }
  next();
}
