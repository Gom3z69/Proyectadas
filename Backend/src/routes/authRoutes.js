import { Router } from 'express';
import {
  iniciarSesion,
  registrar,
  restablecerPassword,
  sesionActual,
  solicitarRecuperacion,
} from '../controllers/authController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';
import { limiteLogin, limiteRecuperacion, limiteRegistro } from '../middlewares/limiteSolicitudes.js';

const router = Router();

router.post('/registro', limiteRegistro, registrar);
router.post('/login', limiteLogin, iniciarSesion);
router.get('/yo', requiereAuth, sesionActual);
router.post('/recuperar', limiteRecuperacion, solicitarRecuperacion);
router.post('/restablecer', limiteRecuperacion, restablecerPassword);

export default router;
