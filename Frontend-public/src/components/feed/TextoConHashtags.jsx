const COLORES = ['text-secondary', 'text-primary', 'text-tertiary']

/** Descripción con los #hashtags resaltados en los colores del diseño. */
export default function TextoConHashtags({ texto, className = '' }) {
  // Con el grupo de captura, los hashtags quedan en las posiciones impares.
  const partes = texto.split(/(#[\p{L}\p{N}_]+)/u)

  return (
    <p className={className}>
      {partes.map((parte, indice) =>
        indice % 2 === 1 ? (
          <span key={indice} className={`font-semibold ${COLORES[((indice - 1) / 2) % COLORES.length]}`}>
            {parte}
          </span>
        ) : (
          parte
        ),
      )}
    </p>
  )
}
