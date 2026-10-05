/** Ícono de Material Symbols. `relleno` usa la variante con relleno (FILL 1). */
export default function Icono({ nombre, relleno = false, className = '' }) {
  return (
    <span className={`icono ${relleno ? 'icono-relleno' : ''} ${className}`} aria-hidden="true">
      {nombre}
    </span>
  )
}
