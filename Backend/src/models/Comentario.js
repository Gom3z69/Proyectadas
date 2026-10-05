import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    // Comentario principal al que responde. Las respuestas tienen un solo nivel, como en TikTok.
    respuestaA: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', default: null },
    texto: {
      type: String,
      required: [true, 'El comentario no puede estar vacío'],
      trim: true,
      maxlength: [500, 'El comentario admite máximo 500 caracteres'],
    },
    likesCount: { type: Number, default: 0, min: 0 },
    respuestasCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

comentarioSchema.index({ video: 1, respuestaA: 1, createdAt: -1 });
comentarioSchema.index({ video: 1, respuestaA: 1, likesCount: -1, createdAt: -1 });
comentarioSchema.index({ respuestaA: 1, createdAt: 1 });

export default mongoose.model('Comentario', comentarioSchema);
