import Notificacion from '../models/Notificacion.js';
import { paginacion } from '../utils/entrada.js';
import { actualizarInsignia, resumenInsignia } from '../utils/insignias.js';
import { CAMPOS_AUTOR, usuarioPublico } from '../utils/serializar.js';

// Con cuántas horas de anticipación se avisa que la racha está por vencer.
const HORAS_AVISO_RACHA = 4;
const HORA_MS = 60 * 60 * 1000;

// Qué datos necesita cada tipo; si alguno ya no existe, la notificación se omite.
const REQUISITOS = {
  seguidor: ['actor'],
  like: ['actor', 'video'],
  comentario: ['actor', 'video', 'comentario'],
  respuesta: ['actor', 'video', 'comentario'],
  like_comentario: ['actor', 'video', 'comentario'],
  racha_por_vencer: [],
  racha_apagada: [],
};

/**
 * Crea, una sola vez por plazo, el aviso de que la racha está por vencer o de que la insignia
 * se apagó y aún se puede revivir. Se evalúa al consultar las notificaciones.
 */
async function avisarRacha(usuario) {
  if (actualizarInsignia(usuario.insignia)) await usuario.save();
  const { estado, venceEn, nivel } = resumenInsignia(usuario.insignia);
  if (!venceEn || !nivel) return;

  let tipo = null;
  if (estado === 'apagada') tipo = 'racha_apagada';
  else if (estado === 'activa' && venceEn - Date.now() <= HORAS_AVISO_RACHA * HORA_MS) tipo = 'racha_por_vencer';
  if (!tipo) return;

  try {
    await Notificacion.updateOne(
      { destinatario: usuario._id, tipo, venceEn },
      { $setOnInsert: { destinatario: usuario._id, tipo, venceEn, nivel } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error; // Otra consulta simultánea ya lo creó.
  }
}

const contarNoLeidas = (usuarioId) => Notificacion.countDocuments({ destinatario: usuarioId, leida: false });

function serializar(notificacion, ahora) {
  const { actor, video, comentario } = notificacion;
  return {
    id: String(notificacion._id),
    tipo: notificacion.tipo,
    leida: notificacion.leida,
    creadoEn: notificacion.createdAt,
    actor: actor ? usuarioPublico(actor, ahora) : null,
    video: video
      ? { id: String(video._id), url: video.url, miniatura: video.miniatura, autor: { username: video.autor?.username } }
      : null,
    comentario: comentario ? { id: String(comentario._id), texto: comentario.texto } : null,
    venceEn: notificacion.venceEn,
    nivel: notificacion.nivel,
  };
}

export async function listarNotificaciones(req, res) {
  await avisarRacha(req.usuario);
  const { limite, salto } = paginacion(req.query, { porDefecto: 15, maximo: 50 });

  const [filas, noLeidas] = await Promise.all([
    Notificacion.find({ destinatario: req.usuario._id })
      .sort({ createdAt: -1, _id: -1 })
      .skip(salto)
      .limit(limite + 1)
      .populate('actor', CAMPOS_AUTOR)
      .populate({ path: 'video', select: 'url miniatura autor', populate: { path: 'autor', select: 'username' } })
      .populate('comentario', 'texto')
      .lean(),
    contarNoLeidas(req.usuario._id),
  ]);

  const ahora = new Date();
  res.json({
    notificaciones: filas
      .slice(0, limite)
      .filter((notificacion) => REQUISITOS[notificacion.tipo].every((campo) => notificacion[campo]))
      .map((notificacion) => serializar(notificacion, ahora)),
    hayMas: filas.length > limite,
    noLeidas,
  });
}

/** Cantidad sin leer (el frontend la consulta periódicamente para el punto de la campana). */
export async function noLeidas(req, res) {
  await avisarRacha(req.usuario);
  res.json({ noLeidas: await contarNoLeidas(req.usuario._id) });
}

/**
 * Marca como leídas las notificaciones hasta `hasta` (la más reciente que se mostró), o todas.
 * Así no se marca una que llegó después de abrir la lista.
 */
export async function marcarLeidas(req, res) {
  const hasta = new Date(typeof req.body?.hasta === 'string' ? req.body.hasta : NaN);
  const filtro = { destinatario: req.usuario._id, leida: false };
  if (!Number.isNaN(hasta.getTime())) filtro.createdAt = { $lte: hasta };

  await Notificacion.updateMany(filtro, { $set: { leida: true } });
  res.json({ noLeidas: await contarNoLeidas(req.usuario._id) });
}
