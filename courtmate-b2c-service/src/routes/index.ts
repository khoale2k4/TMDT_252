import { Router } from 'express';
import venueRoutes from './venueRoutes';

const router = Router();

router.use('/venues', venueRoutes);

export default router;
