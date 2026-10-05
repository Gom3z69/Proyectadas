import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.dirname(fileURLToPath(import.meta.url));

try {
  // Carga el .env sin sobrescribir variables que ya existan en el sistema.
  process.loadEnvFile(path.join(raiz, '.env'));
} catch {
  // Sin archivo .env: se usan únicamente las variables de entorno del sistema.
}

const lista = (valor) =>
  valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const corsOrigenes = lista(process.env.CORS_ORIGIN ?? 'http://localhost:5173');
const smtpUsuario = process.env.SMTP_USER?.trim();

const config = {
  entorno: process.env.NODE_ENV ?? 'development',
  puerto: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/proyectadas',
  jwt: {
    secreto: process.env.JWT_SECRET,
    expiraEn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  corsOrigenes,
  // Dirección del frontend, para los enlaces que se envían por correo.
  frontendUrl: (process.env.FRONTEND_URL ?? corsOrigenes[0] ?? 'http://localhost:5173').replace(/\/$/, ''),
  // Correo saliente (SMTP). Sin SMTP_HOST, los correos se escriben en el log (modo desarrollo).
  correo: {
    host: process.env.SMTP_HOST?.trim(),
    puerto: Number(process.env.SMTP_PORT) || 587,
    seguro: process.env.SMTP_SECURE === 'true',
    usuario: smtpUsuario,
    password: process.env.SMTP_PASS,
    remitente: process.env.CORREO_REMITENTE?.trim() || (smtpUsuario ? `PROYECTADAS <${smtpUsuario}>` : 'PROYECTADAS'),
  },
  // Usuarios con acceso al panel de moderación.
  admins: lista(process.env.ADMINS ?? '').map((nombre) => nombre.toLowerCase().replace(/^@/, '')),
  zonaHoraria: process.env.APP_TIMEZONE ?? 'America/El_Salvador',
  maxVideoMB: Number(process.env.MAX_VIDEO_MB) || 100,
  rutas: {
    raiz,
    uploads: path.join(raiz, 'uploads'),
    log: path.join(raiz, 'backend-local.log'),
    openapi: path.join(raiz, 'openapi.yaml'),
  },
};

if (!config.jwt.secreto) {
  throw new Error('Falta la variable JWT_SECRET. Copia .env.example como .env y define un secreto.');
}

try {
  new Intl.DateTimeFormat('es', { timeZone: config.zonaHoraria });
} catch {
  throw new Error(`APP_TIMEZONE no es una zona horaria válida: "${config.zonaHoraria}"`);
}

export default config;
