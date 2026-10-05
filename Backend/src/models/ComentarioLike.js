import mongoose from 'mongoose';

const comentarioLikeSchema = new mongoose.Schema(
  {
    comentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    // Permite borrar en bloque los me gusta de los comentarios cuando se elimina la proyectada.
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  },
  { timestamps: true },
);

comentarioLikeSchema.index({ comentario: 1, usuario: 1 }, { unique: true });
comentarioLikeSchema.index({ video: 1 });

export default mongoose.model('ComentarioLike', comentarioLikeSchema);
