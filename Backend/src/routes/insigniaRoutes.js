import { Router } from 'express';
import { miInsignia, obtenerNiveles, revivir } from '../controllers/insigniaController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';

const router = Router();

router.get('/niveles', obtenerNiveles);
router.get('/yo', requiereAuth, miInsignia);
router.post('/revivir', requiereAuth, revivir);

export default router;
