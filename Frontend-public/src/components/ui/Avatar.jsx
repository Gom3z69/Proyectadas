import { useState } from 'react'
import { urlArchivo } from '../../services/api'
import { degradadoInsignia, ESTILOS_INSIGNIA } from '../../utils/insignias'

function iniciales(usuario) {
  const base = usuario?.nombre || usuario?.username || '?'
  return base
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Foto de perfil con iniciales de respaldo.
 * anillo: 'ninguno' | 'marca' (degradado de PROYECTADAS) | 'insignia' (colores del nivel del usuario).
 */
export default function Avatar({ usuario, tamano = 40, anillo = 'ninguno', className = '' }) {
  const src = urlArchivo(usuario?.avatar)
  const [srcFallido, setSrcFallido] = useState(null)
  const mostrarImagen = src && srcFallido !== src

  const contenido = mostrarImagen ? (
    <img
      src={src}
      alt=""
      onError={() => setSrcFallido(src)}
      className="h-full w-full rounded-full object-cover"
      draggable={false}
    />
  ) : (
    <span
      className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-secondary-container font-label-lg font-bold text-on-primary-container"
      style={{ fontSize: Math.max(10, tamano * 0.36) }}
    >
      {iniciales(usuario)}
    </span>
  )

  const nivel = usuario?.insignia?.nivel
  const conAnilloInsignia = anillo === 'insignia' && ESTILOS_INSIGNIA[nivel] && usuario.insignia.estado !== 'apagada'
  const conAnilloMarca = anillo === 'marca' || (anillo === 'insignia' && !conAnilloInsignia)

  if (!conAnilloInsignia && !conAnilloMarca) {
    return (
      <span className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`} style={{ width: tamano, height: tamano }}>
        {contenido}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full p-0.5 ${conAnilloMarca ? 'bg-gradient-to-tr from-primary via-secondary to-tertiary shadow-[0_0_10px_rgba(160,120,255,0.4)]' : ''} ${className}`}
      style={
        conAnilloInsignia
          ? { background: degradadoInsignia(nivel, '45deg'), boxShadow: `0 0 14px ${ESTILOS_INSIGNIA[nivel].brillo}99` }
          : undefined
      }
    >
      <span className="inline-flex overflow-hidden rounded-full bg-background" style={{ width: tamano, height: tamano }}>
        {contenido}
      </span>
    </span>
  )
}
