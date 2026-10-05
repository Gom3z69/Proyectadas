import { ApiError } from './ApiError.js';

// Ayudantes para leer datos del cliente de forma segura.

/** Devuelve el texto recortado, o '' si el valor no es un string (evita inyección de operadores $). */
export const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

export const esObjectId = (valor) => typeof valor === 'string' && /^[a-f\d]{24}$/i.test(valor);

export const escaparRegex = (valor) => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function paginacion(query, { porDefecto = 12, maximo = 30 } = {}) {
  const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1);
  const limite = Math.min(maximo, Math.max(1, Number.parseInt(query.limite, 10) || porDefecto));
  return { pagina, limite, salto: (pagina - 1) * limite };
}

/** Extrae #hashtags únicos (en minúsculas) de una descripción. */
export function extraerHashtags(descripcion) {
  const encontrados = descripcion.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(encontrados.map((tag) => tag.slice(1).toLowerCase()))].slice(0, 15);
}

/** Contraseña tal cual llegó (sin recortar espacios), o '' si no es texto. */
export const leerPassword = (valor) => (typeof valor === 'string' ? valor : '');

/** Lanza un error 400 si la contraseña no cumple el largo permitido (bcrypt usa hasta 72 bytes). */
export function validarPassword(password) {
  if (password.length < 6) throw ApiError.solicitudInvalida('La contraseña debe tener al menos 6 caracteres');
  if (password.length > 72) throw ApiError.solicitudInvalida('La contraseña admite máximo 72 caracteres');
}
