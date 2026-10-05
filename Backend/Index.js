import config from './Config.js';
import app from './App.js';
import { conectarBaseDatos, desconectarBaseDatos } from './DataBase.js';
import logger from './src/utils/logger.js';

async function iniciar() {
  await conectarBaseDatos(config.mongoUri);

  const servidor = app.listen(config.puerto, (error) => {
    if (error) {
      logger.error(`No se pudo abrir el puerto ${config.puerto}: ${error.message}`);
      process.exit(1);
    }
    logger.info(`API de PROYECTADAS lista en http://localhost:${config.puerto}/api`);
    logger.info(`Documentación en http://localhost:${config.puerto}/api/docs`);
  });

  const apagar = async (senal) => {
    logger.info(`Señal ${senal} recibida, cerrando servidor...`);
    servidor.close();
    servidor.closeAllConnections();
    await desconectarBaseDatos();
    process.exit(0);
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((error) => {
  logger.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
