import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  },
  { timestamps: true },
);

// Un usuario solo puede dar un like por video.
likeSchema.index({ video: 1, usuario: 1 }, { unique: true });
likeSchema.index({ usuario: 1, createdAt: -1 });

export default mongoose.model('Like', likeSchema);
