import config from '../../Config.js';
import { NIVELES_INSIGNIA, REGLAS_RACHA } from '../Configs/insignias.js';
import { ApiError } from './ApiError.js';

/*
 * Reglas de la racha:
 *   - Cada video publicado suma 1 al progreso y define el nivel (Bronce → Gran Maestro).
 *   - Hay que publicar al menos un video cada 24 h para mantener la insignia "activa".
 *   - Si pasan 24 h sin publicar, la insignia se "apaga". Si quedan oportunidades, hay
 *     24 h más para revivirla (con el botón Revivir o publicando); cada reanimación
 *     consume una oportunidad (3 → 2 → 1 → 0).
 *   - Si se apaga sin oportunidades, o no se revive a tiempo, se pierde y el progreso vuelve a 0.
 *   - Las oportunidades se reinician cada 1° de mes (zona horaria APP_TIMEZONE).
 *
 * El estado se evalúa al leerlo: actualizarInsignia() aplica en orden cronológico las
 * transiciones pendientes, así el resultado es el mismo aunque nadie consulte el perfil
 * justo cuando vence un plazo o cambia el mes.
 */

const HORA_MS = 60 * 60 * 1000;
const PLAZO_PUBLICAR_MS = REGLAS_RACHA.horasParaPublicar * HORA_MS;
const PLAZO_REVIVIR_MS = REGLAS_RACHA.horasParaRevivir * HORA_MS;

const formatoMes = new Intl.DateTimeFormat('en-CA', {
  timeZone: config.zonaHoraria,
  year: 'numeric',
  month: '2-digit',
});

/** Mes calendario (AAAA-MM) de una fecha en la zona horaria de la aplicación. */
export function claveMes(fecha) {
  const partes = Object.fromEntries(
    formatoMes.formatToParts(fecha).map((parte) => [parte.type, parte.value]),
  );
  return `${partes.year}-${partes.month}`;
}

function primerDiaMesSiguiente(mes) {
  const [anio, numero] = mes.split('-').map(Number);
  return numero === 12
    ? `${anio + 1}-01-01`
    : `${anio}-${String(numero + 1).padStart(2, '0')}-01`;
}

const sumarMs = (fecha, ms) => new Date(new Date(fecha).getTime() + ms);

export function nivelPorProgreso(progreso) {
  let nivel = null;
  for (const candidato of NIVELES_INSIGNIA) {
    if (progreso >= candidato.minimo) nivel = candidato;
  }
  return nivel;
}

export function siguienteNivel(progreso) {
  return NIVELES_INSIGNIA.find((nivel) => progreso < nivel.minimo) ?? null;
}

function reiniciarOportunidadesSiCambioMes(ins, fecha) {
  const mes = claveMes(fecha);
  if (ins.mesOportunidades && mes <= ins.mesOportunidades) return false;
  ins.oportunidades = REGLAS_RACHA.oportunidadesPorMes;
  ins.mesOportunidades = mes;
  return true;
}

function perder(ins, fecha) {
  ins.ultimaPerdida = {
    nivel: nivelPorProgreso(ins.progreso)?.clave ?? null,
    progreso: ins.progreso,
    fecha,
  };
  ins.progreso = 0;
  ins.estado = 'sin_insignia';
  ins.apagadaEn = null;
  ins.inicioRacha = null;
}

function reanimar(ins, ahora) {
  ins.oportunidades -= 1;
  ins.estado = 'activa';
  ins.apagadaEn = null;
  ins.ultimaActividad = ahora;
}

/**
 * Aplica las transiciones pendientes hasta `ahora`:
 *   activa  --24 h sin publicar-->  apagada (si quedan oportunidades) o perdida
 *   apagada --24 h sin revivir-->   perdida
 * más el reinicio mensual de oportunidades. Modifica `ins` y devuelve true si cambió.
 */
export function actualizarInsignia(ins, ahora = new Date()) {
  let cambio = false;

  if (ins.estado === 'activa' && ins.ultimaActividad) {
    const vence = sumarMs(ins.ultimaActividad, PLAZO_PUBLICAR_MS);
    if (ahora > vence) {
      // Cuentan las oportunidades del mes en que se apagó, no las del día de la consulta.
      reiniciarOportunidadesSiCambioMes(ins, vence);
      if (ins.oportunidades > 0) {
        ins.estado = 'apagada';
        ins.apagadaEn = vence;
      } else {
        perder(ins, vence);
      }
      cambio = true;
    }
  }

  if (ins.estado === 'apagada' && ins.apagadaEn) {
    const limite = sumarMs(ins.apagadaEn, PLAZO_REVIVIR_MS);
    if (ahora > limite) {
      perder(ins, limite);
      cambio = true;
    }
  }

  if (reiniciarOportunidadesSiCambioMes(ins, ahora)) cambio = true;
  return cambio;
}

/** Revive una insignia apagada consumiendo una oportunidad. */
export function revivirInsignia(ins, ahora = new Date()) {
  actualizarInsignia(ins, ahora);
  if (ins.estado === 'activa') throw ApiError.conflicto('Tu insignia ya está encendida');
  if (ins.estado !== 'apagada') throw ApiError.conflicto('No tienes una insignia apagada que revivir');
  if (ins.oportunidades <= 0) throw ApiError.conflicto('Ya no te quedan oportunidades este mes');
  reanimar(ins, ahora);
}

/** Suma un video a la racha. Si la insignia estaba apagada, publicar la revive. */
export function registrarPublicacion(ins, ahora = new Date()) {
  actualizarInsignia(ins, ahora);
  const nivelAnterior = nivelPorProgreso(ins.progreso);
  let revivida = false;

  if (ins.estado === 'apagada') {
    if (ins.oportunidades > 0) {
      reanimar(ins, ahora);
      revivida = true;
    } else {
      perder(ins, ahora);
    }
  }
  if (ins.estado === 'sin_insignia') {
    ins.progreso = 0;
    ins.inicioRacha = ahora;
  }

  ins.progreso += 1;
  ins.estado = 'activa';
  ins.ultimaActividad = ahora;

  const nivelNuevo = nivelPorProgreso(ins.progreso);
  return {
    revivida,
    nuevoNivel: nivelNuevo && nivelNuevo.clave !== nivelAnterior?.clave ? nivelNuevo.clave : null,
  };
}

/** Descuenta un video eliminado si pertenecía a la racha actual (evita inflar el progreso). */
export function registrarEliminacion(ins, fechaVideo, ahora = new Date()) {
  actualizarInsignia(ins, ahora);
  const cuentaEnRacha = ins.progreso > 0 && ins.inicioRacha && fechaVideo >= ins.inicioRacha;
  if (!cuentaEnRacha) return;

  ins.progreso -= 1;
  if (ins.progreso === 0) {
    ins.estado = 'sin_insignia';
    ins.apagadaEn = null;
    ins.inicioRacha = null;
  }
}

/** Estado completo para el perfil (línea de tiempo, plazos y oportunidades). */
export function resumenInsignia(ins) {
  const nivel = nivelPorProgreso(ins.progreso);
  const siguiente = siguienteNivel(ins.progreso);
  const base = nivel?.minimo ?? 0;
  const porcentaje = siguiente ? ((ins.progreso - base) / (siguiente.minimo - base)) * 100 : 100;

  let venceEn = null;
  if (ins.estado === 'activa' && ins.ultimaActividad) {
    venceEn = sumarMs(ins.ultimaActividad, PLAZO_PUBLICAR_MS);
  } else if (ins.estado === 'apagada' && ins.apagadaEn) {
    venceEn = sumarMs(ins.apagadaEn, PLAZO_REVIVIR_MS);
  }

  return {
    nivel: nivel?.clave ?? null,
    nombre: nivel?.nombre ?? null,
    estado: ins.estado,
    progreso: ins.progreso,
    siguiente: siguiente && {
      clave: siguiente.clave,
      nombre: siguiente.nombre,
      minimo: siguiente.minimo,
      faltan: siguiente.minimo - ins.progreso,
    },
    porcentajeSiguiente: Math.floor(porcentaje),
    venceEn,
    oportunidades: ins.oportunidades,
    oportunidadesPorMes: REGLAS_RACHA.oportunidadesPorMes,
    proximoReinicio: primerDiaMesSiguiente(ins.mesOportunidades ?? claveMes(new Date())),
    ultimaPerdida: ins.ultimaPerdida?.fecha
      ? {
          nivel: ins.ultimaPerdida.nivel,
          progreso: ins.ultimaPerdida.progreso,
          fecha: ins.ultimaPerdida.fecha,
        }
      : null,
  };
}

/** Nivel y estado vigentes de otro usuario, calculados sin modificar su documento. */
export function insigniaVisible(ins, ahora = new Date()) {
  if (!ins) return { nivel: null, estado: 'sin_insignia' };
  const copia = typeof ins.toObject === 'function' ? ins.toObject() : { ...ins };
  actualizarInsignia(copia, ahora);
  return { nivel: nivelPorProgreso(copia.progreso)?.clave ?? null, estado: copia.estado };
}
