import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // En desarrollo, /api y /uploads se redirigen al backend. Cambia BACKEND_URL si usa otro puerto.
  const backend = loadEnv(mode, process.cwd(), '').BACKEND_URL || 'http://localhost:4000'
  const proxy = {
    '/api': backend,
    '/uploads': backend,
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  }
})
