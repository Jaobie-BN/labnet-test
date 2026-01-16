import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';
import { getDashboardStats, getUsers, removeUser, forceRelease } from '../controllers/adminController';

const router = Router();

// Protect all admin routes with Token + Admin Role
router.use(authenticateToken, isAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsers);
router.delete('/users/:id', removeUser);
router.post('/labs/:id/force-release', forceRelease);

export default router;
