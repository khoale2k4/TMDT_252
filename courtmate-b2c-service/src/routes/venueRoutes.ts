import { Router } from 'express';
import { getNearby, getVenueSlots, getVenueDetail } from '../controllers/venueController'; 

const router = Router();

// API 1: Lấy danh sách sân gần đây
router.get('/nearby', getNearby);

// API 5: Lấy chi tiết 1 sân (Gồm thông tin + Slots)
router.get('/:venue_id', getVenueDetail);

// API 2: Lấy slots của sân trong khoảng thời gian (Cái cũ của bạn)
router.get('/:venue_id/slots', getVenueSlots);

export default router;