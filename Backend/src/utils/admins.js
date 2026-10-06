import config from '../../Config.js';

/**
 * Cuentas administradoras (variable ADMINS): entran al panel de moderación, no se pueden suspender
 * y tienen la insignia más alta de forma permanente.
 */
export function esAdmin(usuario) {
  return Boolean(usuario?.username) && config.admins.includes(usuario.username);
}
