import mongoose from 'mongoose';

export const TIPOS_NOTIFICACION = [
  'seguidor', // Empezó a seguirte.
  'like', // Le dio me gusta a tu proyectada.
  'comentario', // Comentó tu proyectada.
  'respuesta', // Respondió a tu comentario.
  'like_comentario', // Le dio me gusta a tu comentario.
  'racha_por_vencer', // Quedan pocas horas para publicar.
  'racha_apagada', // La insignia se apagó y aún se puede revivir.
];

const notificacionSchema = new mongoose.Schema(
  {
    destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipo: { type: String, enum: TIPOS_NOTIFICACION, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
    comentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', default: null },
    // Avisos de racha: el plazo al que se refieren y la insignia en juego.
    venceEn: { type: Date, default: null },
    nivel: { type: String, default: null },
    leida: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificacionSchema.index({ destinatario: 1, createdAt: -1 });
notificacionSchema.index({ destinatario: 1, leida: 1 });
// Un solo aviso de racha por plazo, aunque se consulte muchas veces.
notificacionSchema.index(
  { destinatario: 1, tipo: 1, venceEn: 1 },
  { unique: true, partialFilterExpression: { venceEn: { $type: 'date' } } },
);
notificacionSchema.index({ video: 1 });
notificacionSchema.index({ comentario: 1 });
// Las notificaciones se borran solas a los 90 días.
notificacionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('Notificacion', notificacionSchema, 'notificaciones');
