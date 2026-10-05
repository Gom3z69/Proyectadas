import { Router } from 'express';
import {
  actualizarPerfil,
  buscarUsuarios,
  dejarDeSeguir,
  listarSeguidores,
  listarSeguidos,
  misGuardados,
  misMeGusta,
  misVideos,
  obtenerPerfil,
  seguir,
  videosDeUsuario,
} from '../controllers/usuarioController.js';
import { cambiarCorreo, cambiarPassword, eliminarCuenta } from '../controllers/cuentaController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';
import { limiteConfirmacion } from '../middlewares/limiteSolicitudes.js';
import { subirAvatar } from '../middlewares/subida.js';

const router = Router();

router.use(requiereAuth);

// Rutas fijas antes de /:username para que no se confundan con un nombre de usuario.
router.get('/buscar', buscarUsuarios);
router.patch('/yo', subirAvatar, actualizarPerfil);
router.delete('/yo', limiteConfirmacion, eliminarCuenta);
router.patch('/yo/password', limiteConfirmacion, cambiarPassword);
router.patch('/yo/correo', limiteConfirmacion, cambiarCorreo);
router.get('/yo/guardados', misGuardados);
router.get('/yo/me-gusta', misMeGusta);
router.get('/yo/videos', misVideos);

router.get('/:username', obtenerPerfil);
router.get('/:username/videos', videosDeUsuario);
router.get('/:username/seguidores', listarSeguidores);
router.get('/:username/seguidos', listarSeguidos);
router.post('/:username/seguir', seguir);
router.delete('/:username/seguir', dejarDeSeguir);

export default router;
