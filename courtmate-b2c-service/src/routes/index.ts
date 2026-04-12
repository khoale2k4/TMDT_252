import { Router } from 'express';
import venueRoutes from './venueRoutes';
import slotRoutes from './slotRoutes';
import checkoutRoutes from './checkoutRoutes';

const router = Router();

// Base URL: /v1
router.use('/venues', venueRoutes);
router.use('/slots', slotRoutes);
router.use('/checkouts', checkoutRoutes);

export default router;