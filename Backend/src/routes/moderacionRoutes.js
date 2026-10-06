import { Router } from 'express';
import {
  listarReportes,
  listarSuspendidas,
  reactivarCuenta,
  resolverReporte,
} from '../controllers/moderacionController.js';
import { requiereAdmin, requiereAuth } from '../middlewares/autenticacion.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.use(requiereAuth, requiereAdmin);
router.param('id', validarId);

router.get('/reportes', listarReportes);
router.post('/reportes/:id/resolver', resolverReporte);
router.get('/suspendidas', listarSuspendidas);
router.post('/usuarios/:id/reactivar', reactivarCuenta);

export default router;
