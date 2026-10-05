import { createContext } from 'react'

// Separados de sus Providers para que el recargado en caliente de Vite funcione bien.
export const AuthContext = createContext(null)
export const ToastContext = createContext(null)
