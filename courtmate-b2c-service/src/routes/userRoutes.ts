import { Router } from 'express';
import { getProfileStats, getActivityTracker } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me/stats', authMiddleware, getProfileStats);
router.get('/me/activities', authMiddleware, getActivityTracker);

export default router;
