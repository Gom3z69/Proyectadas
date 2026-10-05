// Error con código HTTP que el manejador global convierte en respuesta JSON.
export class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }

  static solicitudInvalida(mensaje, detalles) {
    return new ApiError(400, mensaje, detalles);
  }

  static noAutorizado(mensaje = 'Debes iniciar sesión') {
    return new ApiError(401, mensaje);
  }

  static prohibido(mensaje = 'No tienes permiso para realizar esta acción') {
    return new ApiError(403, mensaje);
  }

  static noEncontrado(mensaje = 'Recurso no encontrado') {
    return new ApiError(404, mensaje);
  }

  static conflicto(mensaje) {
    return new ApiError(409, mensaje);
  }
}
