import { Router } from 'express';
import { CheckoutController } from '../controllers/checkoutController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const checkoutController = new CheckoutController();

router.post('/', authMiddleware, checkoutController.createCheckout);
router.post('/recurring', authMiddleware, checkoutController.createRecurringCheckout);

export default router;