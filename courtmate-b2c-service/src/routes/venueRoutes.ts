import { Router } from 'express';
import { getNearby,getVenueSlots} from '../controllers/venueController'; 

const router = Router();

router.get('/nearby', getNearby);
router.get('/:venue_id/slots', getVenueSlots);


export default router;