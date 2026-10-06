import { NIVELES_INSIGNIA, REGLAS_RACHA } from '../Configs/insignias.js';
import { ApiError } from '../utils/ApiError.js';
import { esAdmin } from '../utils/admins.js';
import { actualizarInsignia, resumenInsignia, revivirInsignia } from '../utils/insignias.js';

export function obtenerNiveles(req, res) {
  res.json({ niveles: NIVELES_INSIGNIA, reglas: REGLAS_RACHA });
}

export async function miInsignia(req, res) {
  if (actualizarInsignia(req.usuario.insignia)) await req.usuario.save();
  res.json({ insignia: resumenInsignia(req.usuario) });
}

export async function revivir(req, res) {
  if (esAdmin(req.usuario)) throw ApiError.conflicto('Tu insignia es permanente: nunca se apaga');
  revivirInsignia(req.usuario.insignia);
  await req.usuario.save();
  res.json({ insignia: resumenInsignia(req.usuario) });
}
