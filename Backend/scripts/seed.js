/*
 * Crea usuarios de demostración que se siguen entre sí.
 * Si pones videos en scripts/videos-demo/ (mp4, webm, mov...), los publica repartidos entre ellos.
 *
 *   npm run seed               → crea lo que falte
 *   npm run seed -- --limpiar  → borra primero los usuarios demo y todo su contenido
 *
 * Contraseña de todos los usuarios demo: proyectadas123
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../Config.js';
import { conectarBaseDatos, desconectarBaseDatos } from '../DataBase.js';
import { asegurarCarpetas, CARPETAS, TIPOS_VIDEO } from '../src/Configs/archivos.js';
import Comentario from '../src/models/Comentario.js';
import ComentarioLike from '../src/models/ComentarioLike.js';
import Guardado from '../src/models/Guardado.js';
import Like from '../src/models/Like.js';
import Notificacion from '../src/models/Notificacion.js';
import Seguimiento from '../src/models/Seguimiento.js';
import Usuario from '../src/models/Usuario.js';
import Video from '../src/models/Video.js';
import { borrarArchivo, guardarArchivo } from '../src/utils/almacenamiento.js';
import { extraerHashtags } from '../src/utils/entrada.js';
import { actualizarInsignia, nivelPorProgreso, registrarPublicacion } from '../src/utils/insignias.js';

const PASSWORD = 'proyectadas123';
const CARPETA_DEMO = path.join(config.rutas.raiz, 'scripts', 'videos-demo');

const USUARIOS_DEMO = [
  { nombre: 'Valeria Cinema', username: 'valeria_cinema', bio: 'Directora de fotografía. Lentes anamórficas y luces de neón 🎬' },
  { nombre: 'Marcos FX', username: 'marcos_fx', bio: 'Artista CGI · Unreal Engine · efectos que parecen reales ✨' },
  { nombre: 'Elena Visuals', username: 'elena_visuals', bio: 'Ingeniera de sonido y creadora visual 🎧' },
  { nombre: 'Santiago Synth', username: 'santiago_synth', bio: 'Productor de música electrónica. Beats que se ven.' },
  { nombre: 'Dante Lumens', username: 'dante_lumens', bio: 'Coreógrafo de luz: danza, láser y LED 💡' },
];

// Quién sigue a quién (por índice en USUARIOS_DEMO).
const SEGUIMIENTOS = [
  [1, 0], [2, 0], [3, 0], [4, 0],
  [0, 1], [0, 2], [2, 1], [3, 4], [4, 3],
];

const DESCRIPCIONES = [
  'Explorando las sombras de la ciudad con lentes de 50mm. ¿Cuál es su encuadre favorito? #CinemaPro #ProyectadasVIP',
  'Render en tiempo real, cero postproducción 🤯 #CGI #UnrealEngine',
  'El sonido también se ve. Escuchen con audífonos 🎧 #DiseñoSonoro',
  'Beat nuevo cocinándose a medianoche #Synth #MúsicaElectrónica',
  'Coreografía de luz, episodio 3 #Danza #LED',
  'Detrás de cámaras de mi última proyectada #BTS #Proyectadas',
];

const EXTENSIONES = Object.fromEntries(Object.entries(TIPOS_VIDEO).map(([tipo, ext]) => [ext, tipo]));

async function limpiarDemo() {
  const usuarios = await Usuario.find({ username: { $in: USUARIOS_DEMO.map((u) => u.username) } });
  const ids = usuarios.map((u) => u._id);
  const videos = await Video.find({ autor: { $in: ids } });
  const idsVideos = videos.map((v) => v._id);
  const idsComentarios = await Comentario.distinct('_id', { autor: { $in: ids } });

  await Promise.all([
    Like.deleteMany({ $or: [{ usuario: { $in: ids } }, { video: { $in: idsVideos } }] }),
    Guardado.deleteMany({ $or: [{ usuario: { $in: ids } }, { video: { $in: idsVideos } }] }),
    Comentario.deleteMany({ $or: [{ autor: { $in: ids } }, { video: { $in: idsVideos } }] }),
    ComentarioLike.deleteMany({
      $or: [{ usuario: { $in: ids } }, { video: { $in: idsVideos } }, { comentario: { $in: idsComentarios } }],
    }),
    Seguimiento.deleteMany({ $or: [{ seguidor: { $in: ids } }, { seguido: { $in: ids } }] }),
    Notificacion.deleteMany({
      $or: [{ destinatario: { $in: ids } }, { actor: { $in: ids } }, { video: { $in: idsVideos } }],
    }),
    Video.deleteMany({ _id: { $in: idsVideos } }),
  ]);
  await Promise.all(videos.flatMap((v) => [borrarArchivo(v.url), borrarArchivo(v.miniatura)]));
  await Promise.all(usuarios.map((u) => borrarArchivo(u.avatar)));
  await Usuario.deleteMany({ _id: { $in: ids } });
  console.log(`Eliminados ${usuarios.length} usuarios demo y ${videos.length} videos.`);
}

async function crearUsuarios() {
  const usuarios = [];
  for (const datos of USUARIOS_DEMO) {
    let usuario = await Usuario.findOne({ username: datos.username });
    if (!usuario) {
      usuario = new Usuario({ ...datos, email: `${datos.username}@proyectadas.demo`, password: PASSWORD });
      actualizarInsignia(usuario.insignia);
      await usuario.save();
      console.log(`Usuario creado: @${datos.username}`);
    }
    usuarios.push(usuario);
  }
  return usuarios;
}

async function crearSeguimientos(usuarios) {
  await Promise.all(
    SEGUIMIENTOS.map(([seguidor, seguido]) =>
      Seguimiento.updateOne(
        { seguidor: usuarios[seguidor]._id, seguido: usuarios[seguido]._id },
        { $setOnInsert: { seguidor: usuarios[seguidor]._id, seguido: usuarios[seguido]._id } },
        { upsert: true },
      ),
    ),
  );
}

async function publicarVideosDemo(usuarios) {
  let archivos = [];
  try {
    archivos = (await fs.readdir(CARPETA_DEMO)).filter((nombre) => EXTENSIONES[path.extname(nombre).toLowerCase()]);
  } catch {
    // La carpeta es opcional.
  }
  if (archivos.length === 0) {
    console.log('Sin videos en scripts/videos-demo/: solo se crearon usuarios.');
    return;
  }
  if (await Video.exists({ autor: { $in: usuarios.map((u) => u._id) } })) {
    console.log('Los usuarios demo ya tienen videos; usa --limpiar para regenerarlos.');
    return;
  }

  for (const [indice, nombre] of archivos.entries()) {
    const autor = usuarios[indice % usuarios.length];
    const extension = path.extname(nombre).toLowerCase();
    const destino = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
    const copia = path.join(CARPETAS.videos, destino);
    await fs.copyFile(path.join(CARPETA_DEMO, nombre), copia);
    const { size } = await fs.stat(copia);
    // Con Cloudinary configurado, el video se sube a la nube (y se borra la copia local).
    const url = await guardarArchivo({ path: copia, size }, 'videos');

    const descripcion = DESCRIPCIONES[indice % DESCRIPCIONES.length];
    const ahora = new Date();
    registrarPublicacion(autor.insignia, ahora);
    await Video.create({
      autor: autor._id,
      descripcion,
      hashtags: extraerHashtags(descripcion),
      url,
      tipo: EXTENSIONES[extension],
      tamano: size,
      estado: 'publicada',
      publicadoEn: ahora,
      nivelInsignia: nivelPorProgreso(autor.insignia.progreso)?.clave ?? null,
    });
    await autor.save();
    console.log(`Video publicado por @${autor.username}: ${nombre}`);
  }
}

await conectarBaseDatos(config.mongoUri);
try {
  asegurarCarpetas();
  if (process.argv.includes('--limpiar')) await limpiarDemo();
  const usuarios = await crearUsuarios();
  await crearSeguimientos(usuarios);
  await publicarVideosDemo(usuarios);
  console.log(`\nListo. Inicia sesión con cualquiera de: ${USUARIOS_DEMO.map((u) => u.username).join(', ')}`);
  console.log(`Contraseña: ${PASSWORD}`);
} finally {
  await desconectarBaseDatos();
}
