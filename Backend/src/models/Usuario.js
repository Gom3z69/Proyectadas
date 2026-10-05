import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { REGLAS_RACHA } from '../Configs/insignias.js';

export const CUENTA_SUSPENDIDA = 'Tu cuenta está suspendida por incumplir las normas de la comunidad.';

// Estado de la insignia por racha de publicación (ver src/utils/insignias.js).
const insigniaSchema = new mongoose.Schema(
  {
    // Videos publicados en la racha actual; define el nivel de la insignia.
    progreso: { type: Number, default: 0, min: 0 },
    estado: {
      type: String,
      enum: ['sin_insignia', 'activa', 'apagada'],
      default: 'sin_insignia',
    },
    // Última publicación o reanimación: a partir de aquí corren las 24 h.
    ultimaActividad: { type: Date, default: null },
    apagadaEn: { type: Date, default: null },
    inicioRacha: { type: Date, default: null },
    oportunidades: { type: Number, default: REGLAS_RACHA.oportunidadesPorMes, min: 0 },
    // Mes (AAAA-MM) al que corresponden las oportunidades restantes.
    mesOportunidades: { type: String, default: null },
    ultimaPerdida: {
      nivel: { type: String, default: null },
      progreso: { type: Number, default: 0 },
      fecha: { type: Date, default: null },
    },
  },
  { _id: false },
);

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre admite máximo 50 caracteres'],
    },
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9._]{3,24}$/,
        'El usuario debe tener de 3 a 24 caracteres: letras, números, punto o guion bajo',
      ],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido'],
    },
    password: { type: String, required: true, select: false },
    bio: {
      type: String,
      trim: true,
      maxlength: [160, 'La biografía admite máximo 160 caracteres'],
      default: '',
    },
    avatar: { type: String, default: '' },
    insignia: { type: insigniaSchema, default: () => ({}) },
    // Los tokens de sesión emitidos antes de esta fecha dejan de valer (al cambiar la contraseña).
    sesionesDesde: { type: Date, default: null },
    // Enlace para restablecer la contraseña: solo se guarda el hash del token.
    recuperacion: {
      tokenHash: { type: String, default: null, select: false },
      expira: { type: Date, default: null, select: false },
    },
    // Suspensión desde el panel de moderación: no puede iniciar sesión y su contenido se oculta.
    suspendida: { type: Boolean, default: false },
    suspendidaEn: { type: Date, default: null },
  },
  { timestamps: true },
);

usuarioSchema.index({ 'insignia.progreso': -1 });
usuarioSchema.index(
  { 'recuperacion.tokenHash': 1 },
  { partialFilterExpression: { 'recuperacion.tokenHash': { $type: 'string' } } },
);
usuarioSchema.index({ suspendida: 1 }, { partialFilterExpression: { suspendida: true } });

usuarioSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Usuario', usuarioSchema);
