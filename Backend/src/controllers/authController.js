import crypto from 'node:crypto';
import config from '../../Config.js';
import Usuario, { CUENTA_SUSPENDIDA } from '../models/Usuario.js';
import { ApiError } from '../utils/ApiError.js';
import { correoRecuperacion, enviarCorreo } from '../utils/correo.js';
import { leerPassword, texto, validarPassword } from '../utils/entrada.js';
import { actualizarInsignia } from '../utils/insignias.js';
import { usuarioPrivado } from '../utils/serializar.js';
import { firmarToken } from '../utils/token.js';

// Nombres que chocarían con rutas de la API (/usuarios/yo, /usuarios/buscar).
const USUARIOS_RESERVADOS = new Set(['yo', 'buscar', 'admin', 'api', 'proyectadas']);
const VIGENCIA_ENLACE_MS = 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export async function registrar(req, res) {
  const nombre = texto(req.body?.nombre);
  const username = texto(req.body?.username).toLowerCase().replace(/^@/, '');
  const email = texto(req.body?.email).toLowerCase();
  const password = leerPassword(req.body?.password);

  validarPassword(password);
  if (USUARIOS_RESERVADOS.has(username)) {
    throw ApiError.conflicto('Ese nombre de usuario no está disponible');
  }

  const usuario = new Usuario({ nombre, username, email, password });
  actualizarInsignia(usuario.insignia);
  await usuario.save();

  res.status(201).json({ token: firmarToken(usuario), usuario: usuarioPrivado(usuario) });
}

export async function iniciarSesion(req, res) {
  const identificador = texto(req.body?.identificador).toLowerCase().replace(/^@/, '');
  const password = leerPassword(req.body?.password);
  if (!identificador || !password) {
    throw ApiError.solicitudInvalida('Escribe tu usuario o correo y tu contraseña');
  }

  const usuario = await Usuario.findOne({
    $or: [{ email: identificador }, { username: identificador }],
  }).select('+password');

  if (!usuario || !(await usuario.compararPassword(password))) {
    throw ApiError.noAutorizado('Usuario o contraseña incorrectos');
  }
  if (usuario.suspendida) throw ApiError.prohibido(CUENTA_SUSPENDIDA);

  if (actualizarInsignia(usuario.insignia)) await usuario.save();
  res.json({ token: firmarToken(usuario), usuario: usuarioPrivado(usuario) });
}

export async function sesionActual(req, res) {
  if (actualizarInsignia(req.usuario.insignia)) await req.usuario.save();
  res.json({ usuario: usuarioPrivado(req.usuario) });
}

/**
 * Envía un enlace para restablecer la contraseña. Responde igual exista o no el correo,
 * para no revelar qué cuentas están registradas.
 */
export async function solicitarRecuperacion(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  if (!email) throw ApiError.solicitudInvalida('Escribe el correo de tu cuenta');

  const usuario = await Usuario.findOne({ email });
  if (usuario && !usuario.suspendida) {
    const token = crypto.randomBytes(32).toString('hex');
    usuario.recuperacion = { tokenHash: hashToken(token), expira: new Date(Date.now() + VIGENCIA_ENLACE_MS) };
    await usuario.save();
    // Sin esperar el envío: la respuesta tarda lo mismo exista o no la cuenta.
    enviarCorreo(correoRecuperacion(usuario, `${config.frontendUrl}/restablecer?token=${token}`));
  }

  res.json({
    mensaje: 'Si el correo está registrado, te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.',
  });
}

/** Cambia la contraseña con el enlace del correo, cierra las demás sesiones e inicia una nueva. */
export async function restablecerPassword(req, res) {
  const token = texto(req.body?.token);
  const password = leerPassword(req.body?.password);
  validarPassword(password);

  const usuario = /^[a-f0-9]{64}$/.test(token)
    ? await Usuario.findOne({ 'recuperacion.tokenHash': hashToken(token), 'recuperacion.expira': { $gt: new Date() } })
    : null;
  if (!usuario) throw ApiError.solicitudInvalida('El enlace no es válido o ya venció. Pide uno nuevo.');
  if (usuario.suspendida) throw ApiError.prohibido(CUENTA_SUSPENDIDA);

  usuario.password = password;
  usuario.recuperacion = { tokenHash: null, expira: null };
  usuario.sesionesDesde = new Date();
  await usuario.save();

  res.json({ token: firmarToken(usuario), usuario: usuarioPrivado(usuario) });
}
