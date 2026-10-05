import mongoose from 'mongoose';
import Notificacion from './src/models/Notificacion.js';
import Usuario from './src/models/Usuario.js';
import Video from './src/models/Video.js';
import logger from './src/utils/logger.js';

let cierreIntencional = false;

mongoose.connection.on('disconnected', () => {
  if (!cierreIntencional) logger.warn('MongoDB desconectado');
});
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconectado'));
mongoose.connection.on('error', (error) => logger.error(`Error de MongoDB: ${error.message}`));

/** Ajustes idempotentes para los datos guardados por versiones anteriores de la app. */
async function migrarDatos() {
  // Antes de los borradores todos los videos estaban publicados: se publican en su fecha de creación.
  const { modifiedCount } = await Video.collection.updateMany(
    { estado: { $ne: 'borrador' }, publicadoEn: null },
    [{ $set: { estado: 'publicada', publicadoEn: '$createdAt' } }],
  );
  if (modifiedCount) logger.info(`${modifiedCount} videos existentes marcados como publicados`);

  // La insignia "Alejandrita" ahora se llama "Gran Maestro" (clave gran_maestro).
  const renombradas = await Promise.all([
    Video.collection.updateMany({ nivelInsignia: 'alejandrita' }, { $set: { nivelInsignia: 'gran_maestro' } }),
    Usuario.collection.updateMany(
      { 'insignia.ultimaPerdida.nivel': 'alejandrita' },
      { $set: { 'insignia.ultimaPerdida.nivel': 'gran_maestro' } },
    ),
    Notificacion.collection.updateMany({ nivel: 'alejandrita' }, { $set: { nivel: 'gran_maestro' } }),
  ]);
  const totalRenombradas = renombradas.reduce((suma, resultado) => suma + resultado.modifiedCount, 0);
  if (totalRenombradas) logger.info(`${totalRenombradas} registros de la insignia Alejandrita pasaron a Gran Maestro`);
}

export async function conectarBaseDatos(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  // Garantiza que los índices únicos (usuario, correo, likes, seguidores) existan antes de recibir peticiones.
  await Promise.all(mongoose.modelNames().map((nombre) => mongoose.model(nombre).init()));
  await migrarDatos();
  logger.info(`MongoDB conectado a la base "${mongoose.connection.name}"`);
}

export async function desconectarBaseDatos() {
  cierreIntencional = true;
  await mongoose.disconnect();
}
