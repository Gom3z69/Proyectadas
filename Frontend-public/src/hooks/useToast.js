import { useContext } from 'react'
import { ToastContext } from '../context/contextos'

/** toast.exito(titulo, mensaje) · toast.error(mensaje) · toast.info(titulo, mensaje) · toast.insignia(nivel, titulo, mensaje) */
export function useToast() {
  const contexto = useContext(ToastContext)
  if (!contexto) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return contexto
}
