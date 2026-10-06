import { Router } from 'express';
import { crearReporte } from '../controllers/reporteController.js';
import { requiereAuth } from '../middlewares/autenticacion.js';
import { limiteReportes } from '../middlewares/limiteSolicitudes.js';

const router = Router();

router.post('/', requiereAuth, limiteReportes, crearReporte);

export default router;
