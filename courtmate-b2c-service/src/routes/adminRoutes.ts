import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware, isOwner } from '../middlewares/authMiddleware';

import multer from 'multer';

const router = Router();
const adminController = new AdminController();
const upload = multer({ storage: multer.memoryStorage() });

// Bảo vệ bằng middleware auth + isOwner
router.use(authMiddleware, isOwner);

router.get('/dashboard/stats', adminController.getDashboardStats);

// Venue CRUD
router.get('/venues', adminController.getVenues);
router.post('/venues', adminController.createVenue);
router.put('/venues/:id', adminController.updateVenue);
router.delete('/venues/:id', adminController.deleteVenue);

// Generic file upload
router.post('/upload-image', upload.single('image'), adminController.uploadImage);

// Court CRUD
router.post('/venues/:id/courts', adminController.createCourt);
router.put('/courts/:id', adminController.updateCourt);
router.delete('/courts/:id', adminController.deleteCourt);

// Slot CRUD
router.get('/venues/:id/slots', adminController.getSlots);
router.post('/venues/:id/slots', adminController.generateSlots);
router.put('/slots/:id', adminController.updateSlot);
router.delete('/slots/:id', adminController.deleteSlot);

// Pricing Rules Proxy
router.get('/pricing-rules/test', adminController.getPricingRules);
router.post('/pricing-rules/new-rule', adminController.createPricingRule);
router.put('/pricing-rules/refresh-active-rules', adminController.refreshPricingRules);

export default router;
