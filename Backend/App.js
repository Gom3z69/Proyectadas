import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import config from './Config.js';
import { asegurarCarpetas } from './src/Configs/archivos.js';
import { montarDocumentacion } from './src/Configs/swagger.js';
import { manejarErrores, rutaNoEncontrada } from './src/middlewares/errores.js';
import { registrarPeticiones } from './src/middlewares/registroPeticiones.js';
import rutas from './src/routes/index.js';

asegurarCarpetas();

const app = express();

// Confía en X-Forwarded-For solo del proxy que corresponda (TRUST_PROXY): por defecto, el proxy local de Vite.
// En un hosting hay que indicar cuántos proxies hay delante; si no, todos los visitantes compartirían la IP
// del proxy y, con ella, los mismos límites de inicio de sesión y registro.
app.set('trust proxy', config.trustProxy);

app.use(
  helmet({
    // Permite que el frontend (otro puerto/dominio) reproduzca videos y muestre imágenes.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Sin esto, /api/docs falla al abrirse por HTTP desde la red local (p. ej. desde el celular).
    contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
  }),
);
app.use(cors({ origin: config.corsOrigenes }));
app.use(express.json({ limit: '100kb' }));

// Archivos subidos (videos, miniaturas, avatares). Soporta peticiones Range para adelantar videos.
app.use('/uploads', express.static(config.rutas.uploads, { maxAge: '7d', index: false }));

app.use(registrarPeticiones);
montarDocumentacion(app);
app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
