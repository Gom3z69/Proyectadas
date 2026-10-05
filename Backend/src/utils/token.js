import jwt from 'jsonwebtoken';
import config from '../../Config.js';

export function firmarToken(usuario) {
  return jwt.sign({ sub: String(usuario._id) }, config.jwt.secreto, {
    expiresIn: config.jwt.expiraEn,
  });
}

export function verificarToken(token) {
  return jwt.verify(token, config.jwt.secreto);
}
