import { Router } from 'express';
import * as venueController from '../controllers/venueController';

const router = Router();

router.get('/nearby', venueController.getNearbyVenues);

export default router;
