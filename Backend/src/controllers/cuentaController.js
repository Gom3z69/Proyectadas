import Usuario from '../models/Usuario.js';
import { ApiError } from '../utils/ApiError.js';
import { correoEmailCambiado, correoPasswordCambiada, enviarCorreo } from '../utils/correo.js';
import { eliminarCuentaCompleta } from '../utils/eliminaciones.js';
import { leerPassword, texto, validarPassword } from '../utils/entrada.js';
import { usuarioPrivado } from '../utils/serializar.js';
import { firmarToken } from '../utils/token.js';

/**
 * Confirma la contraseña actual antes de un cambio sensible. Responde 400 (no 401) para que el
 * frontend no lo confunda con una sesión vencida.
 */
async function confirmarPassword(usuarioId, valor) {
  const password = leerPassword(valor);
  if (!password) throw ApiError.solicitudInvalida('Escribe tu contraseña actual');
  const usuario = await Usuario.findById(usuarioId).select('+password');
  if (!(await usuario.compararPassword(password))) {
    throw ApiError.solicitudInvalida('La contraseña actual no es correcta');
  }
  return usuario;
}

/** Cambia la contraseña y cierra las sesiones de los demás dispositivos (esta sigue abierta). */
export async function cambiarPassword(req, res) {
  const nueva = leerPassword(req.body?.nueva);
  validarPassword(nueva);
  const usuario = await confirmarPassword(req.usuario._id, req.body?.actual);
  if (await usuario.compararPassword(nueva)) {
    throw ApiError.solicitudInvalida('La contraseña nueva debe ser distinta de la actual');
  }

  usuario.password = nueva;
  usuario.sesionesDesde = new Date();
  usuario.recuperacion = { tokenHash: null, expira: null };
  await usuario.save();
  enviarCorreo(correoPasswordCambiada(usuario));

  res.json({ token: firmarToken(usuario), usuario: usuarioPrivado(usuario) });
}

/** Cambia el correo de la cuenta y avisa a la dirección anterior. */
export async function cambiarCorreo(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  if (!email) throw ApiError.solicitudInvalida('Escribe el correo nuevo');
  const usuario = await confirmarPassword(req.usuario._id, req.body?.password);
  if (email === usuario.email) throw ApiError.solicitudInvalida('Ese ya es el correo de tu cuenta');

  const anterior = usuario.email;
  usuario.email = email;
  await usuario.save();
  enviarCorreo(correoEmailCambiado(usuario, anterior));

  res.json({ usuario: usuarioPrivado(usuario) });
}

/** Elimina la cuenta con todo su contenido. No se puede deshacer. */
export async function eliminarCuenta(req, res) {
  const usuario = await confirmarPassword(req.usuario._id, req.body?.password);
  await eliminarCuentaCompleta(usuario);
  res.json({ eliminada: true });
}
