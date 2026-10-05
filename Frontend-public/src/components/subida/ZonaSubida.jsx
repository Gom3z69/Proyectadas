import { useState } from 'react'
import { LIMITE_VIDEO_MB } from '../../utils/subida'
import Icono from '../ui/Icono'

/** Zona para soltar el video o abrir la galería / el explorador de archivos. */
export default function ZonaSubida({ onAbrir, onSoltar, deshabilitada = false }) {
  const [arrastrando, setArrastrando] = useState(false)

  function alSoltar(evento) {
    evento.preventDefault()
    setArrastrando(false)
    if (!deshabilitada) onSoltar(evento.dataTransfer.files?.[0])
  }

  return (
    <div
      onClick={() => !deshabilitada && onAbrir()}
      onDragOver={(evento) => {
        evento.preventDefault()
        setArrastrando(true)
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={alSoltar}
      className={`group relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-xl p-space-lg text-center shadow-md transition-all ${
        deshabilitada ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      } ${arrastrando ? 'bg-surface-container-high ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative mb-space-md flex h-24 w-24 items-center justify-center">
        <svg className="h-24 w-24 text-primary" fill="none" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeDasharray="6 6" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="50" cy="50" r="32" fill="currentColor" fillOpacity="0.08" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icono nombre="videocam" className="text-4xl text-primary drop-shadow-[0_0_12px_rgba(208,188,255,0.75)]" />
        </div>
        <Icono nombre="filter_drama" className="absolute -top-1 -right-1 text-2xl text-secondary drop-shadow-[0_0_8px_#4cd7f6]" />
      </div>

      <span className="mb-space-xs font-headline-sm text-headline-sm text-on-surface">Selecciona un archivo de video</span>
      <p className="mb-space-md max-w-xs font-body-md text-body-md text-on-surface-variant">
        Arrastra tu Proyectada aquí o explora desde tu dispositivo. Relación de aspecto recomendada vertical{' '}
        <strong className="text-on-surface">9:16</strong>.
      </p>
      <div className="mb-space-lg flex flex-wrap items-center justify-center gap-space-xs font-label-sm text-label-sm text-outline">
        {['MP4', 'WEBM', 'MOV'].map((formato) => (
          <span key={formato} className="rounded-full bg-surface-container-high px-2 py-0.5 text-on-surface-variant">
            {formato}
          </span>
        ))}
        <span>• Hasta {LIMITE_VIDEO_MB} MB</span>
      </div>

      {/* El clic sube hasta la tarjeta, que abre el selector (galería en el celular, explorador en la compu). */}
      <button
        type="button"
        disabled={deshabilitada}
        className="relative z-10 flex items-center gap-space-xs rounded-full bg-surface-container-highest px-space-lg py-3 font-label-md text-label-md font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-bright"
      >
        <Icono nombre="folder_open" className="text-base text-primary" />
        Explorar archivos / Galería
      </button>
    </div>
  )
}
