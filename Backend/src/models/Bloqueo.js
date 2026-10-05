import mongoose from 'mongoose';

// Un bloqueo oculta a las dos cuentas entre sí: no ven el contenido de la otra ni pueden interactuar.
const bloqueoSchema = new mongoose.Schema(
  {
    bloqueador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    bloqueado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { timestamps: true },
);

bloqueoSchema.index({ bloqueador: 1, bloqueado: 1 }, { unique: true });
bloqueoSchema.index({ bloqueado: 1 });

export default mongoose.model('Bloqueo', bloqueoSchema);
