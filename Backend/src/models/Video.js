import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    // Un borrador solo lo ve su autor y no cuenta para la racha hasta que se publica.
    estado: { type: String, enum: ['publicada', 'borrador'], default: 'publicada' },
    publicadoEn: { type: Date, default: null },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, 'La descripción admite máximo 300 caracteres'],
      default: '',
    },
    hashtags: { type: [String], default: [] },
    url: { type: String, required: true },
    miniatura: { type: String, default: '' },
    duracion: { type: Number, default: 0, min: 0 },
    tipo: { type: String, required: true },
    tamano: { type: Number, required: true },
    // Contadores desnormalizados para ordenar el feed sin recalcular.
    likesCount: { type: Number, default: 0, min: 0 },
    comentariosCount: { type: Number, default: 0, min: 0 },
    guardadosCount: { type: Number, default: 0, min: 0 },
    vistas: { type: Number, default: 0, min: 0 },
    // Insignia que alcanzó el autor con esta publicación (se muestra en su perfil).
    nivelInsignia: { type: String, default: null },
  },
  { timestamps: true },
);

videoSchema.index({ autor: 1, estado: 1, publicadoEn: -1 });
videoSchema.index({ estado: 1, publicadoEn: -1 });
videoSchema.index({ hashtags: 1 });

export default mongoose.model('Video', videoSchema);
