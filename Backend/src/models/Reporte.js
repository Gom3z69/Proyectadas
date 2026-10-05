import mongoose from 'mongoose';

export const MOTIVOS_REPORTE = ['spam', 'acoso', 'odio', 'violencia', 'sexual', 'suplantacion', 'derechos', 'otro'];

const reporteSchema = new mongoose.Schema(
  {
    reportante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipo: { type: String, enum: ['video', 'comentario', 'usuario'], required: true },
    // Contenido reportado según el tipo; `usuario` es su autor o la cuenta reportada.
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
    comentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', default: null },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    motivo: { type: String, enum: MOTIVOS_REPORTE, required: true },
    detalle: { type: String, trim: true, maxlength: [300, 'El detalle admite máximo 300 caracteres'], default: '' },
    estado: { type: String, enum: ['pendiente', 'resuelto', 'descartado'], default: 'pendiente' },
    resolucion: {
      accion: { type: String, default: null },
      por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
      fecha: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

// Cada persona puede reportar una sola vez el mismo contenido.
reporteSchema.index({ reportante: 1, tipo: 1, video: 1, comentario: 1, usuario: 1 }, { unique: true });
reporteSchema.index({ estado: 1, createdAt: -1 });
reporteSchema.index({ usuario: 1 });

export default mongoose.model('Reporte', reporteSchema);
