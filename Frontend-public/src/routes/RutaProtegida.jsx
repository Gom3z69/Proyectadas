import { Navigate, Outlet, useLocation } from 'react-router'
import PantallaCarga from '../components/ui/PantallaCarga'
import { useAuth } from '../hooks/useAuth'

/** Solo deja pasar con sesión iniciada; si no, manda a /login recordando a dónde se quería ir. */
export default function RutaProtegida() {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <PantallaCarga />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />
  return <Outlet />
}
