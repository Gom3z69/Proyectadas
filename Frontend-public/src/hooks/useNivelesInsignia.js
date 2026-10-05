import { useEffect, useState } from 'react'
import { obtenerNiveles } from '../services/insigniaService'
import { NIVELES_POR_DEFECTO, REGLAS_POR_DEFECTO } from '../utils/insignias'

/** Lee un dato de la configuración de insignias del backend; mientras llega usa el respaldo. */
function useConfigInsignias(campo, respaldo) {
  const [valor, setValor] = useState(respaldo)

  useEffect(() => {
    let vigente = true
    obtenerNiveles()
      .then((datos) => vigente && setValor(datos[campo]))
      .catch(() => {
        // Se mantiene el respaldo.
      })
    return () => {
      vigente = false
    }
  }, [campo])

  return valor
}

/** Niveles de insignia con sus umbrales reales (los define el backend). */
export const useNivelesInsignia = () => useConfigInsignias('niveles', NIVELES_POR_DEFECTO)

/** Reglas de la racha: horas para publicar y para revivir, y vidas por mes. */
export const useReglasRacha = () => useConfigInsignias('reglas', REGLAS_POR_DEFECTO)
