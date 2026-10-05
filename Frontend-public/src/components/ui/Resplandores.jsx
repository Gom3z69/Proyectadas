/**
 * Resplandores ambientales del diseño (violeta arriba, cian abajo).
 * Capa fija y recortada: nunca ensancha la página (en celular eso desplazaba los elementos fijos).
 */
export default function Resplandores() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-12 left-1/4 h-96 w-96 rounded-full bg-primary-container/10 blur-[140px]" />
      <div className="absolute right-1/4 bottom-10 h-[32rem] w-[32rem] rounded-full bg-secondary-container/10 blur-[160px]" />
    </div>
  )
}
