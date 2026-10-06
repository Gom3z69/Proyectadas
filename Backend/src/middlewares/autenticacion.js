import Usuario, { CUENTA_SUSPENDIDA } from '../models/Usuario.js';
import { ApiError } from '../utils/ApiError.js';
import { esAdmin } from '../utils/admins.js';
import { verificarToken } from '../utils/token.js';

/** Exige un token "Authorization: Bearer <jwt>" válido y deja el usuario en req.usuario. */
export async function requiereAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw ApiError.noAutorizado();

  let payload;
  try {
    payload = verificarToken(token);
  } catch {
    throw ApiError.noAutorizado('Tu sesión expiró, inicia sesión de nuevo');
  }

  const usuario = await Usuario.findById(payload.sub);
  if (!usuario) throw ApiError.noAutorizado('La cuenta ya no existe');
  if (usuario.suspendida) throw ApiError.noAutorizado(CUENTA_SUSPENDIDA);
  // Al cambiar la contraseña se cierran las sesiones abiertas antes del cambio.
  if (usuario.sesionesDesde && payload.iat < Math.floor(usuario.sesionesDesde.getTime() / 1000)) {
    throw ApiError.noAutorizado('Tu contraseña cambió. Inicia sesión de nuevo.');
  }

  req.usuario = usuario;
  next();
}

/** Solo para las cuentas de ADMINS (panel de moderación). Va después de requiereAuth. */
export function requiereAdmin(req, res, next) {
  if (!esAdmin(req.usuario)) {
    throw ApiError.prohibido('Solo los administradores pueden entrar a moderación');
  }
  next();
}
