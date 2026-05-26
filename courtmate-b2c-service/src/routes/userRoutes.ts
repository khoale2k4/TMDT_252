import { Router } from 'express';
import { getProfileStats, getActivityTracker } from '../controllers/userController';

const router = Router();

router.get('/me/stats', getProfileStats);
router.get('/me/activities', getActivityTracker);

export default router;
