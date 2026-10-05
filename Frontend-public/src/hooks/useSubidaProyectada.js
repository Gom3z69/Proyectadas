import { useEffect, useRef, useState } from 'react'
import { urlArchivo } from '../services/api'
import { editarBorrador, publicarBorrador, publicarVideo } from '../services/videoService'
import { formatearBytes } from '../utils/formato'
import { analizarVideo } from '../utils/miniatura'
import {
  LIMITE_IMAGEN_MB,
  LIMITE_VIDEO_MB,
  MAX_DESCRIPCION,
  normalizarVideo,
  TIPOS_IMAGEN,
  TIPOS_VIDEO,
} from '../utils/subida'
import { useToast } from './useToast'

const MB = 1024 * 1024

/**
 * Flujo de "Mis Proyectadas": elegir un video (o retomar un borrador), analizarlo en el navegador,
 * escoger portada (uno de sus fotogramas o una imagen propia), escribir la descripción y
 * publicarlo o guardarlo como borrador.
 * - onPublicado(respuesta): recibe { video, insignia, evento } del backend.
 * - onBorradorGuardado(video): recibe el borrador creado o actualizado.
 */
export function useSubidaProyectada({ onPublicado, onBorradorGuardado }) {
  const toast = useToast()
  const seleccion = useRef(null)
  const control = useRef(null)
  const [archivo, setArchivo] = useState(null) // { file, url, nombre }; file es null si el video ya está subido
  const [borrador, setBorrador] = useState(null) // borrador guardado que se está editando
  const [analisis, setAnalisis] = useState(null) // null mientras se analiza
  const [fotogramas, setFotogramas] = useState([]) // [{ tiempo, blob, url }]
  const [portada, setPortada] = useState(0) // índice del fotograma o 'personal'
  const [portadaPersonal, setPortadaPersonal] = useState(null) // { file, url } o la guardada { url }
  const [descripcion, setDescripcionInterna] = useState('')
  const [progreso, setProgreso] = useState(null) // null = sin enviar
  const [accion, setAccion] = useState(null) // 'publicar' | 'borrador' mientras se envía

  // Libera las URL temporales de las vistas previas cuando cambian o al salir.
  useEffect(() => () => archivo?.file && URL.revokeObjectURL(archivo.url), [archivo])
  useEffect(() => () => fotogramas.forEach((fotograma) => URL.revokeObjectURL(fotograma.url)), [fotogramas])
  useEffect(() => () => portadaPersonal?.file && URL.revokeObjectURL(portadaPersonal.url), [portadaPersonal])

  /** Empieza a editar otro video: limpia lo anterior y analiza el nuevo en segundo plano. */
  async function cargar({ nuevoArchivo, nuevoBorrador = null, portadaGuardada = null, texto = '' }) {
    const marca = {}
    seleccion.current = marca
    setArchivo(nuevoArchivo)
    setBorrador(nuevoBorrador)
    setAnalisis(null)
    setFotogramas([])
    setPortadaPersonal(portadaGuardada)
    setPortada(portadaGuardada ? 'personal' : 0)
    setDescripcionInterna(texto)
    setProgreso(null)
    setAccion(null)

    const resultado = await analizarVideo(nuevoArchivo.file ?? nuevoArchivo.url)
    if (seleccion.current !== marca) return // Ya eligieron otro video.
    setAnalisis({
      duracion: resultado.duracion || nuevoBorrador?.duracion || 0,
      ancho: resultado.ancho,
      alto: resultado.alto,
    })
    setFotogramas(resultado.fotogramas.map((fotograma) => ({ ...fotograma, url: URL.createObjectURL(fotograma.blob) })))
  }

  function elegir(original) {
    if (!original) return
    const file = normalizarVideo(original)
    if (!TIPOS_VIDEO.has(file.type)) return toast.error('Formato no soportado. Usa un video MP4, WEBM o MOV.')
    if (file.size > LIMITE_VIDEO_MB * MB) {
      return toast.error(`El video pesa ${formatearBytes(file.size)}; el máximo es ${LIMITE_VIDEO_MB} MB.`)
    }
    return cargar({ nuevoArchivo: { file, url: URL.createObjectURL(file), nombre: file.name } })
  }

  /** Retoma un borrador guardado: su video, su descripción y su portada actual. */
  function continuarBorrador(video) {
    return cargar({
      nuevoArchivo: { file: null, url: urlArchivo(video.url), nombre: video.descripcion || 'Borrador sin descripción' },
      nuevoBorrador: video,
      portadaGuardada: video.miniatura ? { url: urlArchivo(video.miniatura) } : null,
      texto: video.descripcion ?? '',
    })
  }

  function elegirPortadaPersonal(imagen) {
    if (!imagen) return
    if (!TIPOS_IMAGEN.has(imagen.type)) return toast.error('La portada debe ser una imagen JPG, PNG o WEBP.')
    if (imagen.size > LIMITE_IMAGEN_MB * MB) return toast.error(`La portada supera ${LIMITE_IMAGEN_MB} MB.`)
    setPortadaPersonal({ file: imagen, url: URL.createObjectURL(imagen) })
    setPortada('personal')
  }

  const setDescripcion = (texto) => setDescripcionInterna(texto.slice(0, MAX_DESCRIPCION))

  function agregarEtiqueta(etiqueta) {
    setDescripcionInterna((actual) => {
      const base = actual.trimEnd()
      return (base ? `${base} ${etiqueta}` : etiqueta).slice(0, MAX_DESCRIPCION)
    })
  }

  function descartar() {
    seleccion.current = null
    setArchivo(null)
    setBorrador(null)
    setAnalisis(null)
    setFotogramas([])
    setPortada(0)
    setPortadaPersonal(null)
    setDescripcionInterna('')
    setProgreso(null)
    setAccion(null)
  }

  /** Descripción y portada elegida. La portada ya guardada de un borrador no se vuelve a enviar. */
  function formulario() {
    const datos = new FormData()
    datos.append('descripcion', descripcion.trim())
    if (portada === 'personal') {
      if (portadaPersonal?.file) datos.append('miniatura', portadaPersonal.file, portadaPersonal.file.name)
    } else if (fotogramas[portada]) {
      datos.append('miniatura', fotogramas[portada].blob, 'portada.jpg')
    }
    return datos
  }

  async function enviar(tipo) {
    // Un video nuevo necesita su análisis (duración y portada); un borrador ya está en el servidor.
    if (!archivo || progreso !== null || (!borrador && !analisis)) return
    const datos = formulario()
    control.current = new AbortController()
    const senal = control.current.signal
    setAccion(tipo)
    setProgreso(borrador ? 100 : 0)
    try {
      let respuesta
      if (borrador) {
        respuesta = await (tipo === 'publicar' ? publicarBorrador : editarBorrador)(borrador.id, datos, senal)
      } else {
        if (analisis.duracion) datos.append('duracion', String(analisis.duracion))
        if (tipo === 'borrador') datos.append('borrador', 'true')
        datos.append('video', archivo.file)
        respuesta = await publicarVideo(datos, { onProgreso: setProgreso, senal })
      }
      descartar()
      if (tipo === 'publicar') onPublicado(respuesta)
      else onBorradorGuardado(respuesta.video)
    } catch (error) {
      setProgreso(null)
      setAccion(null)
      if (error.name === 'AbortError') toast.info(tipo === 'publicar' ? 'Publicación cancelada' : 'Guardado cancelado')
      else toast.error(error.message, tipo === 'publicar' ? 'No se pudo publicar' : 'No se pudo guardar el borrador')
    }
  }

  return {
    archivo,
    borrador,
    analisis,
    analizando: Boolean(archivo) && !analisis,
    listo: Boolean(archivo) && (Boolean(analisis) || Boolean(borrador)),
    fotogramas,
    portada,
    portadaPersonal,
    descripcion,
    progreso,
    accion,
    subiendo: progreso !== null,
    elegir,
    continuarBorrador,
    elegirPortada: setPortada,
    elegirPortadaPersonal,
    setDescripcion,
    agregarEtiqueta,
    descartar,
    publicar: () => enviar('publicar'),
    guardarBorrador: () => enviar('borrador'),
    cancelar: () => control.current?.abort(),
  }
}
