import { ApiError } from '../utils/ApiError.js';
import { esObjectId } from '../utils/entrada.js';

/** Para router.param(): rechaza identificadores que no son ObjectId válidos. */
export function validarId(req, res, next, valor) {
  if (!esObjectId(valor)) return next(ApiError.solicitudInvalida('Identificador inválido'));
  next();
}
