import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../../Config.js';

/** Ruta pública (/uploads/...) de un archivo guardado por multer. */
export function rutaPublica(archivo) {
  const relativa = path.relative(config.rutas.uploads, archivo.path).split(path.sep).join('/');
  return `/uploads/${relativa}`;
}

/** Elimina un archivo a partir de su ruta pública, sin salir nunca de la carpeta uploads. */
export async function borrarArchivoPublico(ruta) {
  if (typeof ruta !== 'string' || !ruta.startsWith('/uploads/')) return;
  const absoluta = path.resolve(config.rutas.uploads, ruta.slice('/uploads/'.length));
  if (!absoluta.startsWith(config.rutas.uploads + path.sep)) return;
  await fs.rm(absoluta, { force: true });
}

/** Limpia los archivos que multer guardó en una petición que terminó en error. */
export function borrarArchivosDePeticion(req) {
  const archivos = [req.file, ...Object.values(req.files ?? {}).flat()].filter(Boolean);
  return Promise.all(archivos.map((archivo) => fs.rm(archivo.path, { force: true }).catch(() => {})));
}
