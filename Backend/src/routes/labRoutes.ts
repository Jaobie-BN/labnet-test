import { Router, Request, Response } from 'express';
import { getAllLabs, getLabById, getSystemStats } from '../services/labService';

const router = Router();

// GET /api/labs - Get all labs
router.get('/', (req: Request, res: Response) => {
  const labs = getAllLabs();
  res.json(labs);
});

// GET /api/labs/stats - Get system stats
router.get('/stats', (req: Request, res: Response) => {
  const stats = getSystemStats();
  res.json(stats);
});

// GET /api/labs/:id - Get single lab by ID
router.get('/:id', (req: Request, res: Response) => {
  const lab = getLabById(req.params.id);
  if (!lab) {
    return res.status(404).json({ message: 'Lab not found' });
  }
  res.json(lab);
});

export default router;
