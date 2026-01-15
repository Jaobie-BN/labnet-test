import { Router } from 'express';
import { login } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);

// Route /me removed after testing

export default router;
