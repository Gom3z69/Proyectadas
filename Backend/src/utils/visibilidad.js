// Qué contenido no debe ver cada persona: cuentas bloqueadas (en ambos sentidos), cuentas
// suspendidas y lo que ella misma reportó.
import Bloqueo from '../models/Bloqueo.js';
import Reporte from '../models/Reporte.js';
import Usuario from '../models/Usuario.js';

/** { autores, videos, comentarios } que se excluyen de lo que ve `usuarioId`. */
export async function contenidoOculto(usuarioId) {
  const [bloqueos, suspendidas, reportes] = await Promise.all([
    Bloqueo.find({ $or: [{ bloqueador: usuarioId }, { bloqueado: usuarioId }] }).select('bloqueador bloqueado').lean(),
    Usuario.distinct('_id', { suspendida: true }),
    Reporte.find({ reportante: usuarioId, tipo: { $in: ['video', 'comentario'] } }).select('tipo video comentario').lean(),
  ]);

  const autores = new Map(suspendidas.map((id) => [String(id), id]));
  for (const bloqueo of bloqueos) {
    const otro = bloqueo.bloqueador.equals(usuarioId) ? bloqueo.bloqueado : bloqueo.bloqueador;
    autores.set(String(otro), otro);
  }
  return {
    autores: [...autores.values()],
    videos: reportes.filter((reporte) => reporte.tipo === 'video').map((reporte) => reporte.video),
    comentarios: reportes.filter((reporte) => reporte.tipo === 'comentario').map((reporte) => reporte.comentario),
  };
}

/** True si `usuarioId` no debe ver ni interactuar con `otroId` (bloqueo en cualquier sentido o cuenta suspendida). */
export async function autorOculto(usuarioId, otroId) {
  if (usuarioId.equals(otroId)) return false;
  const [bloqueo, suspendida] = await Promise.all([
    Bloqueo.exists({
      $or: [
        { bloqueador: usuarioId, bloqueado: otroId },
        { bloqueador: otroId, bloqueado: usuarioId },
      ],
    }),
    Usuario.exists({ _id: otroId, suspendida: true }),
  ]);
  return Boolean(bloqueo || suspendida);
}

/** Relación de bloqueo entre dos cuentas: { yoBloquee, meBloqueo }. */
export async function estadoBloqueo(usuarioId, otroId) {
  const filas = await Bloqueo.find({
    $or: [
      { bloqueador: usuarioId, bloqueado: otroId },
      { bloqueador: otroId, bloqueado: usuarioId },
    ],
  })
    .select('bloqueador')
    .lean();
  return {
    yoBloquee: filas.some((fila) => fila.bloqueador.equals(usuarioId)),
    meBloqueo: filas.some((fila) => fila.bloqueador.equals(otroId)),
  };
}
