import { useId } from 'react'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'

// Estrella de 5 puntas centrada en (12, 12) para las medallas.
const ESTRELLA = 'M12 7.6l1.12 2.86 3.06.18-2.37 1.95.78 2.97L12 13.9l-2.59 1.66.78-2.97-2.37-1.95 3.06-.18z'

function Forma({ forma, relleno, simple }) {
  if (forma === 'circulo') {
    return (
      <>
        <circle cx="12" cy="12" r="10.5" fill={relleno} />
        {!simple && (
          <>
            <circle cx="12" cy="12" r="7.6" fill="none" stroke="#fff" strokeOpacity=".38" strokeWidth=".9" />
            <path d={ESTRELLA} fill="#fff" fillOpacity=".6" />
            <path d="M5.2 9.2a7.6 7.6 0 0 1 4-4.4" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
          </>
        )}
      </>
    )
  }
  if (forma === 'diamante') {
    // Gema tallada: corona trapezoidal arriba y pabellón en punta abajo.
    return (
      <>
        <path d="M2.5 9 7.2 3.2h9.6L21.5 9 12 21.8z" fill={relleno} />
        {!simple && (
          <>
            <path
              d="M2.5 9h19M7.2 3.2 9.8 9 12 21.8M16.8 3.2 14.2 9 12 21.8M9.8 9 12 3.2 14.2 9"
              fill="none"
              stroke="#fff"
              strokeOpacity=".55"
              strokeWidth=".8"
              strokeLinejoin="round"
            />
            <path d="M7.2 3.2h9.6L14.2 9H9.8z" fill="#fff" fillOpacity=".22" />
          </>
        )}
      </>
    )
  }
  if (forma === 'rombo') {
    return (
      <>
        <path d="M12 1.2 22.8 12 12 22.8 1.2 12z" fill={relleno} />
        {!simple && (
          <>
            <path d="M12 6.4 17.6 12 12 17.6 6.4 12z" fill="#fff" fillOpacity=".2" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
            <path d="M12 1.2 6.4 6.8" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
          </>
        )}
      </>
    )
  }
  // corona
  return (
    <>
      <path d="M3 17.2 4.2 7.6l4.4 4.5L12 4.6l3.4 7.5 4.4-4.5 1.2 9.6z" fill={relleno} />
      <rect x="3" y="18.2" width="18" height="2.8" rx="1.2" fill={relleno} />
      {!simple && (
        <>
          <path d="M3.4 15.2h17.2" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
          <circle cx="4.2" cy="6.6" r="1.4" fill="#FF6B9A" />
          <circle cx="12" cy="3.5" r="1.6" fill="#fff" />
          <circle cx="19.8" cy="6.6" r="1.4" fill="#FF6B9A" />
          <circle cx="12" cy="19.6" r="0.9" fill="#4EDEA3" />
        </>
      )}
    </>
  )
}

/**
 * Silueta de la insignia: círculo (bronce, plata, oro), diamante, rombo (rubí) o corona (gran maestro).
 * `apagada` la muestra en gris, sin brillo. `simple` quita los detalles internos (para poner un ícono encima).
 */
export default function IconoInsignia({ nivel, tamano = 16, apagada = false, brillo = true, simple = false, className = '' }) {
  const id = useId()
  const estilo = ESTILOS_INSIGNIA[nivel]
  if (!estilo) return null

  const [inicio, medio, fin] = estilo.degradado
  const idDegradado = `degradado-${id}`
  let filtro
  if (apagada) filtro = 'grayscale(1) brightness(0.75)'
  else if (brillo) filtro = `drop-shadow(0 0 ${Math.max(2, tamano / 5)}px ${estilo.brillo}b3)`

  return (
    <svg
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      className={`shrink-0 ${className}`}
      style={filtro ? { filter: filtro } : undefined}
      role="img"
      aria-label={`Insignia ${estilo.nombre}${apagada ? ' (apagada)' : ''}`}
    >
      <defs>
        <linearGradient id={idDegradado} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={inicio} />
          <stop offset=".55" stopColor={medio} />
          <stop offset="1" stopColor={fin} />
        </linearGradient>
      </defs>
      <Forma forma={estilo.forma} relleno={`url(#${idDegradado})`} simple={simple} />
    </svg>
  )
}
