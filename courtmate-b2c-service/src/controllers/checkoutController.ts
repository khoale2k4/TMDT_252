import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkoutService';

export class CheckoutController {
  private checkoutService = new CheckoutService();

  public createCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id as string; 
      const body = req.body;

      const data = await this.checkoutService.processCheckout(userId, body);

      res.status(201).json({ data });
    } catch (error: any) {
      if (error.status && error.error) {
        res.status(error.status).json({ error: error.error });
      } else {
        next(error); // Đẩy lỗi xuống errorHandler.ts của bạn
      }
    }
  };

  public createRecurringCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || "user-123"; 
      const body = req.body;

      const data = await this.checkoutService.processRecurringCheckout(userId, body);

      res.status(201).json({ data });
    } catch (error: any) {
      if (error.status && error.error) {
        res.status(error.status).json({ error: error.error });
      } else {
        next(error); 
      }
    }
  };
}