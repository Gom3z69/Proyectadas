import { Router } from 'express';
import { crearComentario, listarComentarios } from '../controllers/comentarioController.js';
import {
  darLike,
  editarBorrador,
  eliminarVideo,
  guardarVideo,
  obtenerFeed,
  obtenerVideo,
  publicarBorrador,
  publicarVideo,
  quitarGuardado,
  quitarLike,
  registrarVista,
} from '../controllers/videoController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';
import { subirPortada, subirVideo } from '../middlewares/subida.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.use(requiereAuth);
router.param('id', validarId);

router.get('/feed', obtenerFeed);
router.post('/', subirVideo, publicarVideo);

router.get('/:id', obtenerVideo);
router.patch('/:id', subirPortada, editarBorrador);
router.delete('/:id', eliminarVideo);
router.post('/:id/publicar', subirPortada, publicarBorrador);
router.post('/:id/like', darLike);
router.delete('/:id/like', quitarLike);
router.post('/:id/guardar', guardarVideo);
router.delete('/:id/guardar', quitarGuardado);
router.post('/:id/vista', registrarVista);
router.get('/:id/comentarios', listarComentarios);
router.post('/:id/comentarios', crearComentario);

export default router;
