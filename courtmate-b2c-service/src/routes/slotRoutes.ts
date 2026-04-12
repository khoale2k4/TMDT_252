import { Router } from 'express';
import { SlotController } from '../controllers/slotController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const slotController = new SlotController();

router.post('/:slot_id/lock', authMiddleware, slotController.lockSlot);

export default router;