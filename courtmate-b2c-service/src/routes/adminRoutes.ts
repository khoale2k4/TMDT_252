import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware, isOwner } from '../middlewares/authMiddleware';

const router = Router();
const adminController = new AdminController();

// Bảo vệ bằng middleware auth + isOwner
router.use(authMiddleware, isOwner);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/venues', adminController.getVenues);
router.post('/venues', adminController.createVenue);
router.post('/venues/:id/slots', adminController.generateSlots);

export default router;
