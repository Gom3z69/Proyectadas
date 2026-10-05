import { Router } from 'express';
import authRoutes from './authRoutes.js';
import comentarioRoutes from './comentarioRoutes.js';
import insigniaRoutes from './insigniaRoutes.js';
import notificacionRoutes from './notificacionRoutes.js';
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

export default router;
