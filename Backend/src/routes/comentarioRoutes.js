import { Router } from 'express';
import {
  darLikeComentario,
  eliminarComentario,
  listarRespuestas,
  quitarLikeComentario,
} from '../controllers/comentarioController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.use(requiereAuth);
router.param('id', validarId);

router.get('/:id/respuestas', listarRespuestas);
router.post('/:id/like', darLikeComentario);
router.delete('/:id/like', quitarLikeComentario);
router.delete('/:id', eliminarComentario);

export default router;
