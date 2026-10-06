/*
 * Sube a Cloudinary los archivos que todavía están en Backend/uploads/ (videos, portadas y fotos de
 * perfil) y actualiza sus direcciones en la base de datos. Se puede ejecutar varias veces: solo mueve
 * lo que falta.
 *
 *   npm run nube:migrar
 *
 * Necesita CLOUDINARY_URL (o CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET) en el .env.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../Config.js';
import { conectarBaseDatos, desconectarBaseDatos } from '../DataBase.js';
import Usuario from '../src/models/Usuario.js';
import Video from '../src/models/Video.js';
import { enNube, subirANube } from '../src/utils/almacenamiento.js';

const resumen = { subidos: 0, faltantes: 0, errores: 0 };

/** Sube un archivo de /uploads/... y devuelve su URL en la nube (o null si no se pudo). */
async function mover(ruta, carpeta) {
  const local = path.join(config.rutas.uploads, ruta.slice('/uploads/'.length));
  let tamano;
  try {
    ({ size: tamano } = await fs.stat(local));
  } catch {
    console.warn(`  ⚠ No existe el archivo ${ruta}; se deja como está.`);
    resumen.faltantes += 1;
    return null;
  }
  try {
    const url = await subirANube(local, carpeta, tamano);
    resumen.subidos += 1;
    return { url, local };
  } catch (error) {
    console.error(`  ✖ No se pudo subir ${ruta}: ${error.message}`);
    resumen.errores += 1;
    return null;
  }
}

/** Sube los campos locales de un documento, guarda las URLs nuevas y solo entonces borra los archivos locales. */
async function migrar(documento, campos) {
  const cambios = {};
  const locales = [];
  for (const [campo, carpeta] of campos) {
    const valor = documento[campo];
    if (typeof valor !== 'string' || !valor.startsWith('/uploads/')) continue;
    const subido = await mover(valor, carpeta);
    if (!subido) continue;
    cambios[campo] = subido.url;
    locales.push(subido.local);
  }
  if (!locales.length) return;
  await documento.constructor.updateOne({ _id: documento._id }, { $set: cambios }, { timestamps: false });
  await Promise.all(locales.map((local) => fs.rm(local, { force: true })));
}

if (!enNube) {
  console.error('Cloudinary no está configurado: define CLOUDINARY_URL en Backend/.env y vuelve a intentarlo.');
  process.exitCode = 1;
} else {
  await conectarBaseDatos(config.mongoUri);
  try {
    const videos = await Video.find({ $or: [{ url: /^\/uploads\// }, { miniatura: /^\/uploads\// }] });
    console.log(`Proyectadas con archivos locales: ${videos.length}`);
    for (const video of videos) {
      await migrar(video, [
        ['url', 'videos'],
        ['miniatura', 'miniaturas'],
      ]);
    }
    const usuarios = await Usuario.find({ avatar: /^\/uploads\// });
    console.log(`Fotos de perfil locales: ${usuarios.length}`);
    for (const usuario of usuarios) await migrar(usuario, [['avatar', 'avatares']]);
    console.log(
      `\nListo: ${resumen.subidos} archivos subidos a Cloudinary, ${resumen.faltantes} no encontrados y ${resumen.errores} con error.`,
    );
  } finally {
    await desconectarBaseDatos();
  }
}
