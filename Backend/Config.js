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

/**
 * TRUST_PROXY: cuántos proxies hay delante del servidor (un número) o una lista de Express como "loopback".
 * Sin definirla, solo se confía en el proxy local (el de Vite). Nunca true: cualquiera podría falsear su IP.
 */
function leerTrustProxy(valor) {
  if (!valor) return 'loopback';
  if (/^(true|false)$/i.test(valor)) {
    throw new Error('TRUST_PROXY debe ser un número de proxies (por ejemplo 1) o una lista como "loopback", no true/false.');
  }
  return /^\d+$/.test(valor) ? Number(valor) : valor;
}

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
  // Proxies delante del servidor, para leer la IP real de cada visitante (límites de solicitudes).
  trustProxy: leerTrustProxy(process.env.TRUST_PROXY?.trim()),
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
  // Archivos en Cloudinary (opcional). Sin credenciales se guardan en uploads/.
  cloudinary: {
    url: process.env.CLOUDINARY_URL?.trim(),
    nombre: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    clave: process.env.CLOUDINARY_API_KEY?.trim(),
    secreto: process.env.CLOUDINARY_API_SECRET?.trim(),
    carpeta: process.env.CLOUDINARY_CARPETA?.trim() || 'proyectadas',
  },
  // Límites anti-spam por usuario.
  limites: {
    subidasPorHora: Number(process.env.LIMITE_SUBIDAS_POR_HORA) || 20,
    comentariosPor10Min: Number(process.env.LIMITE_COMENTARIOS_POR_10_MIN) || 30,
  },
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
