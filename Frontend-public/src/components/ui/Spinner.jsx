/** `colores` reemplaza los colores por defecto (p. ej. 'border-current/30 border-t-current' dentro de un botón). */
export default function Spinner({ tamano = 24, colores = 'border-surface-container-highest border-t-primary', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 ${colores} ${className}`}
      style={{ width: tamano, height: tamano }}
    />
  )
}
