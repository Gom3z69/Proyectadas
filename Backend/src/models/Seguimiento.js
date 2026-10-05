import mongoose from 'mongoose';

// Relación "seguidor sigue a seguido".
const seguimientoSchema = new mongoose.Schema(
  {
    seguidor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    seguido: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { timestamps: true },
);

seguimientoSchema.index({ seguidor: 1, seguido: 1 }, { unique: true });
seguimientoSchema.index({ seguido: 1, createdAt: -1 });

export default mongoose.model('Seguimiento', seguimientoSchema);
