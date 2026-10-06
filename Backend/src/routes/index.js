import { Router } from 'express';
import authRoutes from './authRoutes.js';
import comentarioRoutes from './comentarioRoutes.js';
import insigniaRoutes from './insigniaRoutes.js';
import moderacionRoutes from './moderacionRoutes.js';
import notificacionRoutes from './notificacionRoutes.js';
import reporteRoutes from './reporteRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import videoRoutes from './videoRoutes.js';

const router = Router();

router.get('/salud', (req, res) => res.json({ estado: 'ok', fecha: new Date() }));

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/videos', videoRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/insignias', insigniaRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/reportes', reporteRoutes);
router.use('/moderacion', moderacionRoutes);

export default router;
