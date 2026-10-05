import { Router } from 'express';
import { listarNotificaciones, marcarLeidas, noLeidas } from '../controllers/notificacionController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';

const router = Router();

router.use(requiereAuth);

router.get('/', listarNotificaciones);
router.get('/no-leidas', noLeidas);
router.post('/leer', marcarLeidas);

export default router;
