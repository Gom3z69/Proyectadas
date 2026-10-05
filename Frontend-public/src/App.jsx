import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  )
}
