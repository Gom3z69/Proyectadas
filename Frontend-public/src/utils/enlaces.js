/** Ruta del perfil: el propio va a /perfil y el de otros a /u/:username. */
export function rutaPerfil(username, usuarioActual) {
  return username === usuarioActual?.username ? '/perfil' : `/u/${username}`
}

/** Enlace para compartir una proyectada: abre el perfil del autor con el video. */
export function enlaceVideo(video) {
  return `${window.location.origin}/u/${video.autor.username}?v=${video.id}`
}

export async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Respaldo para HTTP sin contexto seguro (por ejemplo, al probar desde el celular por IP).
    const campo = document.createElement('textarea')
    campo.value = texto
    campo.style.position = 'fixed'
    campo.style.opacity = '0'
    document.body.append(campo)
    campo.select()
    const copiado = document.execCommand('copy')
    campo.remove()
    return copiado
  }
}
