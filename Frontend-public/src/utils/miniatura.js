// Analiza un video en el navegador: duración, tamaño y fotogramas para elegir la portada
// (no se procesa nada en el servidor).

const LADO_MAXIMO = 720
const TIEMPO_LIMITE_MS = 15000
// Momentos del video (proporción de su duración) de donde se toman los fotogramas candidatos.
const PROPORCIONES = [0.15, 0.5, 0.85]

function esperarEvento(elemento, evento) {
  return new Promise((resolve, reject) => {
    const ok = () => {
      limpiar()
      resolve()
    }
    const fallo = () => {
      limpiar()
      reject(new Error('No se pudo leer el video'))
    }
    const limpiar = () => {
      elemento.removeEventListener(evento, ok)
      elemento.removeEventListener('error', fallo)
    }
    elemento.addEventListener(evento, ok, { once: true })
    elemento.addEventListener('error', fallo, { once: true })
  })
}

async function leerDuracion(video) {
  if (Number.isFinite(video.duration)) return video.duration
  // Los WEBM grabados en el navegador reportan Infinity hasta recorrerlos: se fuerza el cálculo.
  video.currentTime = Number.MAX_SAFE_INTEGER
  await esperarEvento(video, 'timeupdate')
  const duracion = Number.isFinite(video.duration) ? video.duration : 0
  video.currentTime = 0
  return duracion
}

async function capturar(video, lienzo, tiempo) {
  video.currentTime = tiempo
  await esperarEvento(video, 'seeked')
  lienzo.getContext('2d').drawImage(video, 0, 0, lienzo.width, lienzo.height)
  return new Promise((resolve) => lienzo.toBlob(resolve, 'image/jpeg', 0.82))
}

async function analizar(url, remota) {
  const video = document.createElement('video')
  // Un video ya subido puede venir de otro dominio: sin CORS el lienzo no podría exportar los fotogramas.
  if (remota) video.crossOrigin = 'anonymous'
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url
  await esperarEvento(video, 'loadedmetadata')

  const duracion = await leerDuracion(video)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(video.videoWidth, video.videoHeight))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(video.videoWidth * escala)
  lienzo.height = Math.round(video.videoHeight * escala)

  const tiempos = duracion > 0 ? PROPORCIONES.map((proporcion) => duracion * proporcion) : [0.1]
  const fotogramas = []
  for (const tiempo of tiempos) {
    const blob = await capturar(video, lienzo, tiempo)
    if (blob) fotogramas.push({ tiempo, blob })
  }

  return { duracion, ancho: video.videoWidth, alto: video.videoHeight, fotogramas }
}

/**
 * Analiza un archivo de video o la URL de uno ya subido (un borrador).
 * Devuelve { duracion, ancho, alto, fotogramas: [{ tiempo, blob }] }. Nunca lanza: si falla, devuelve valores vacíos.
 */
export async function analizarVideo(fuente) {
  const remota = typeof fuente === 'string'
  const url = remota ? fuente : URL.createObjectURL(fuente)
  const vacio = { duracion: 0, ancho: 0, alto: 0, fotogramas: [] }
  const proceso = analizar(url, remota).catch(() => vacio)
  const limite = new Promise((resolve) => setTimeout(() => resolve(vacio), TIEMPO_LIMITE_MS))
  try {
    return await Promise.race([proceso, limite])
  } finally {
    if (!remota) URL.revokeObjectURL(url)
  }
}
