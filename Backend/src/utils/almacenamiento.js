// Dónde viven los archivos subidos: en Cloudinary si hay credenciales; si no, en Backend/uploads/.
// Multer siempre guarda primero en uploads/ (ahí se validan); con Cloudinary ese archivo es temporal.
import fs from 'node:fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../Config.js';
import { ApiError } from './ApiError.js';
import { borrarArchivoPublico, rutaPublica } from './archivos.js';
import logger from './logger.js';

function credencialesNube() {
  const { url, nombre, clave, secreto } = config.cloudinary;
  if (url) {
    const partes = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!partes) throw new Error('CLOUDINARY_URL debe tener la forma cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
    return { api_key: partes[1], api_secret: partes[2], cloud_name: partes[3] };
  }
  return nombre && clave && secreto ? { cloud_name: nombre, api_key: clave, api_secret: secreto } : null;
}

const credenciales = credencialesNube();
if (credenciales) cloudinary.config({ ...credenciales, secure: true });

/** True si los archivos nuevos se guardan en Cloudinary. */
export const enNube = Boolean(credenciales);

const RECURSOS = { videos: 'video', miniaturas: 'image', avatares: 'image' };
// Los archivos grandes se suben en partes (más confiable; Cloudinary lo exige desde 100 MB).
const SUBIDA_POR_PARTES = 20 * 1024 * 1024;

// Los errores del SDK no siempre son Error: a veces traen el mensaje dentro de `error`.
const detalle = (error) => error?.message ?? error?.error?.message ?? String(error);

const conCallback = (iniciar) =>
  new Promise((resolve, reject) => iniciar((error, resultado) => (error ? reject(error) : resolve(resultado))));

/** Sube un archivo local a Cloudinary (sin borrarlo) y devuelve su URL pública. */
export async function subirANube(ruta, carpeta, tamano) {
  const opciones = {
    resource_type: RECURSOS[carpeta],
    folder: `${config.cloudinary.carpeta}/${carpeta}`,
    unique_filename: true,
    overwrite: false,
  };
  const resultado =
    tamano > SUBIDA_POR_PARTES
      ? await conCallback((listo) => cloudinary.uploader.upload_large(ruta, { ...opciones, chunk_size: 6 * 1024 * 1024 }, listo))
      : await cloudinary.uploader.upload(ruta, opciones);
  return resultado.secure_url;
}

/**
 * Guarda un archivo que recibió multer y devuelve su URL pública: la de Cloudinary o /uploads/...
 * Con Cloudinary, el archivo local se borra (era temporal).
 */
export async function guardarArchivo(archivo, carpeta) {
  if (!enNube) return rutaPublica(archivo);
  try {
    return await subirANube(archivo.path, carpeta, archivo.size);
  } catch (error) {
    logger.error(`Cloudinary rechazó un archivo de ${carpeta}: ${detalle(error)}`);
    throw new ApiError(502, 'No se pudo guardar el archivo en la nube. Intenta de nuevo en un momento.');
  } finally {
    await fs.rm(archivo.path, { force: true });
  }
}

/** Guarda varios archivos (los que vengan vacíos se ignoran); si uno falla, borra los que ya se subieron. */
export async function guardarArchivos(lista) {
  const urls = [];
  try {
    for (const { archivo, carpeta } of lista) urls.push(archivo ? await guardarArchivo(archivo, carpeta) : '');
    return urls;
  } catch (error) {
    await Promise.all(urls.map(borrarArchivo));
    throw error;
  }
}

/** Tipo y public_id de un archivo de nuestra nube a partir de su URL (null si no es nuestro). */
export function datosDeNube(url) {
  const partes = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  if (!partes || partes[1] !== credenciales?.cloud_name) return null;
  return { recurso: partes[2], publicId: partes[3] };
}

/** Borra un archivo guardado, esté en uploads/ o en Cloudinary. Nunca lanza. */
export async function borrarArchivo(url) {
  if (typeof url !== 'string' || !url) return;
  if (url.startsWith('/uploads/')) return borrarArchivoPublico(url);
  const datos = datosDeNube(url);
  if (!datos) return;
  try {
    await cloudinary.uploader.destroy(datos.publicId, { resource_type: datos.recurso, invalidate: true });
  } catch (error) {
    logger.error(`No se pudo borrar de Cloudinary ${datos.publicId}: ${detalle(error)}`);
  }
}
