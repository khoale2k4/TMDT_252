import { Router } from 'express';
import venueRoutes from './venueRoutes';
import slotRoutes from './slotRoutes';
import checkoutRoutes from './checkoutRoutes';
import userRoutes from './userRoutes';
import lobbyRoutes from './lobbyRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.use('/venues', venueRoutes);
router.use('/slots', slotRoutes);
router.use('/checkouts', checkoutRoutes);
router.use('/users', userRoutes);
router.use('/lobbies', lobbyRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);

export default router;