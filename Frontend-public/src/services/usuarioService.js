import { peticion } from './api'

const ruta = (username) => `/usuarios/${encodeURIComponent(username)}`

export const obtenerPerfil = (username) => peticion(ruta(username))

/** orden: 'recientes' (por defecto) o 'populares'. La respuesta incluye el `total` publicado. */
export const obtenerVideosDeUsuario = (username, pagina = 1, { limite = 12, orden = 'recientes' } = {}) =>
  peticion(`${ruta(username)}/videos?pagina=${pagina}&limite=${limite}&orden=${orden}`)

/** Mis Proyectadas con borradores. estado: 'todas' | 'publicadas' | 'borradores'. Incluye el `conteo` de cada estado. */
export const obtenerMisVideos = (pagina = 1, { limite = 12, estado = 'todas' } = {}) =>
  peticion(`/usuarios/yo/videos?pagina=${pagina}&limite=${limite}&estado=${estado}`)

/** Mis Favoritos (proyectadas guardadas). */
export const obtenerMisGuardados = (pagina = 1) => peticion(`/usuarios/yo/guardados?pagina=${pagina}`)

/** Proyectadas a las que di me gusta. */
export const obtenerMisMeGusta = (pagina = 1) => peticion(`/usuarios/yo/me-gusta?pagina=${pagina}`)

export const buscarUsuarios = (texto, senal) =>
  peticion(`/usuarios/buscar?q=${encodeURIComponent(texto)}`, { senal })

/** datos: FormData (con avatar) u objeto { nombre, bio, quitarAvatar }. */
export const actualizarPerfil = (datos) =>
  peticion('/usuarios/yo', datos instanceof FormData ? { metodo: 'PATCH', formulario: datos } : { metodo: 'PATCH', datos })

/** Devuelve una sesión nueva: las de los demás dispositivos se cierran. */
export const cambiarPassword = (actual, nueva) =>
  peticion('/usuarios/yo/password', { metodo: 'PATCH', datos: { actual, nueva } })

export const cambiarCorreo = (email, password) =>
  peticion('/usuarios/yo/correo', { metodo: 'PATCH', datos: { email, password } })

/** Elimina la cuenta con todo su contenido. */
export const eliminarCuenta = (password) => peticion('/usuarios/yo', { metodo: 'DELETE', datos: { password } })

/** Bloquear oculta a ambas cuentas entre sí y deshace los seguimientos. */
export const bloquear = (username) => peticion(`${ruta(username)}/bloquear`, { metodo: 'POST' })

export const desbloquear = (username) => peticion(`${ruta(username)}/bloquear`, { metodo: 'DELETE' })

export const listarBloqueados = (pagina = 1) => peticion(`/usuarios/yo/bloqueados?pagina=${pagina}`)

export const seguir = (username) => peticion(`${ruta(username)}/seguir`, { metodo: 'POST' })

export const dejarDeSeguir = (username) => peticion(`${ruta(username)}/seguir`, { metodo: 'DELETE' })

export const listarSeguidores = (username, pagina = 1) => peticion(`${ruta(username)}/seguidores?pagina=${pagina}`)

export const listarSeguidos = (username, pagina = 1) => peticion(`${ruta(username)}/seguidos?pagina=${pagina}`)
