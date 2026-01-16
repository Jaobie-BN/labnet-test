import { Router } from 'express';
import authRoutes from './authRoutes';
import labRoutes from './labRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/labs', labRoutes);
router.use('/admin', adminRoutes);

export default router;
