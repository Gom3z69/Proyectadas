import { NIVELES_INSIGNIA, REGLAS_RACHA } from '../Configs/insignias.js';
import { actualizarInsignia, resumenInsignia, revivirInsignia } from '../utils/insignias.js';

export function obtenerNiveles(req, res) {
  res.json({ niveles: NIVELES_INSIGNIA, reglas: REGLAS_RACHA });
}

export async function miInsignia(req, res) {
  if (actualizarInsignia(req.usuario.insignia)) await req.usuario.save();
  res.json({ insignia: resumenInsignia(req.usuario.insignia) });
}

export async function revivir(req, res) {
  revivirInsignia(req.usuario.insignia);
  await req.usuario.save();
  res.json({ insignia: resumenInsignia(req.usuario.insignia) });
}
