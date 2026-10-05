import fs from 'node:fs';
import config from '../../Config.js';

// Escribe en consola y agrega cada línea a backend-local.log.
const archivo = fs.createWriteStream(config.rutas.log, { flags: 'a' });

function escribir(nivel, mensaje) {
  const linea = `[${new Date().toISOString()}] ${nivel.padEnd(5)} ${mensaje}`;
  if (nivel === 'ERROR') console.error(linea);
  else if (nivel === 'WARN') console.warn(linea);
  else console.log(linea);
  archivo.write(`${linea}\n`);
}

const logger = {
  info: (mensaje) => escribir('INFO', mensaje),
  warn: (mensaje) => escribir('WARN', mensaje),
  error: (mensaje) => escribir('ERROR', mensaje),
};

export default logger;
