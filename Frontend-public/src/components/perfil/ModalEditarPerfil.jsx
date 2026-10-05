import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { actualizarPerfil } from '../../services/usuarioService'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

const MAX_BIO = 160
const MAX_IMAGEN_MB = 5
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']

/** Formulario para cambiar foto, nombre y biografía. Se monta solo mientras está abierto. */
export default function ModalEditarPerfil({ perfil, onCerrar, onGuardado }) {
  const { actualizarUsuario } = useAuth()
  const toast = useToast()
  const entrada = useRef(null)
  const [nombre, setNombre] = useState(perfil.nombre)
  const [bio, setBio] = useState(perfil.bio)
  const [foto, setFoto] = useState(null) // { archivo, url }
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto])

  function elegirFoto(archivo) {
    if (!archivo) return
    if (!TIPOS_IMAGEN.includes(archivo.type)) return toast.error('La foto debe ser JPG, PNG o WEBP.')
    if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) return toast.error(`La foto supera ${MAX_IMAGEN_MB} MB.`)
    setFoto({ archivo, url: URL.createObjectURL(archivo) })
    setQuitarFoto(false)
  }

  async function guardar(evento) {
    evento.preventDefault()
    setGuardando(true)
    try {
      let datos = { nombre: nombre.trim(), bio: bio.trim(), quitarAvatar: quitarFoto }
      if (foto) {
        datos = new FormData()
        datos.append('nombre', nombre.trim())
        datos.append('bio', bio.trim())
        datos.append('avatar', foto.archivo)
      }
      const { usuario } = await actualizarPerfil(datos)
      actualizarUsuario(usuario)
      onGuardado(usuario)
      toast.exito('Perfil actualizado')
      onCerrar()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setGuardando(false)
    }
  }

  let vistaPrevia = perfil
  if (foto) vistaPrevia = { ...perfil, avatar: foto.url }
  else if (quitarFoto) vistaPrevia = { ...perfil, avatar: '' }

  return (
    <Modal abierto onCerrar={guardando ? () => {} : onCerrar} titulo="Editar perfil">
      <form id="formulario-perfil" onSubmit={guardar} className="space-y-6 px-6 pt-2 pb-6">
        <div className="flex items-center gap-5">
          <Avatar usuario={vistaPrevia} tamano={88} anillo="marca" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              className="flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-bright"
            >
              <Icono nombre="photo_camera" className="text-lg" /> Cambiar foto
            </button>
            {(perfil.avatar || foto) && !quitarFoto && (
              <button
                type="button"
                onClick={() => {
                  setFoto(null)
                  setQuitarFoto(true)
                }}
                className="font-label-md text-label-md text-on-surface-variant hover:text-error"
              >
                Quitar foto
              </button>
            )}
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(evento) => {
                elegirFoto(evento.target.files?.[0])
                evento.target.value = ''
              }}
            />
          </div>
        </div>

        <label className="block space-y-2">
          <span className="font-label-lg text-label-lg text-on-surface">Nombre</span>
          <input
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            maxLength={50}
            required
            minLength={2}
            className="w-full rounded-2xl bg-surface-container px-4 py-3 font-body-md text-body-md text-on-surface shadow-inner placeholder:text-outline focus:bg-surface-container-high focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="flex items-center justify-between font-label-lg text-label-lg text-on-surface">
            Biografía
            <span className="font-label-sm text-label-sm text-outline">
              {bio.length}/{MAX_BIO}
            </span>
          </span>
          <textarea
            value={bio}
            onChange={(evento) => setBio(evento.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            placeholder="Cuéntale al mundo qué proyectas..."
            className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 font-body-md text-body-md text-on-surface shadow-inner placeholder:text-outline focus:bg-surface-container-high focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="rounded-full px-5 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-label-lg text-label-lg font-bold text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] transition-all hover:bg-primary-fixed active:scale-95 disabled:opacity-60"
          >
            {guardando && <Spinner tamano={16} colores="border-on-primary/30 border-t-on-primary" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  )
}
