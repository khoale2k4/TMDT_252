import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const reviewController = new ReviewController();

router.post('/', authMiddleware, reviewController.createReview);

export default router;
