import mongoose from 'mongoose';

// Proyectada guardada en "Favoritos" por un usuario.
const guardadoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  },
  { timestamps: true },
);

guardadoSchema.index({ video: 1, usuario: 1 }, { unique: true });
guardadoSchema.index({ usuario: 1, createdAt: -1 });

export default mongoose.model('Guardado', guardadoSchema);
