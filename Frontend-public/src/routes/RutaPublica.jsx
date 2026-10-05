import { Navigate, Outlet, useLocation } from 'react-router'
import PantallaCarga from '../components/ui/PantallaCarga'
import { useAuth } from '../hooks/useAuth'

/** Login y Registro: si ya hay sesión, regresa a la página de origen (o al inicio). */
export default function RutaPublica() {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <PantallaCarga />
  if (usuario) {
    const desde = location.state?.desde
    return <Navigate to={desde ? `${desde.pathname}${desde.search ?? ''}` : '/'} replace />
  }
  return <Outlet />
}
