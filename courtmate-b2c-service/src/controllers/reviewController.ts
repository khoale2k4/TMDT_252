import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';

export class ReviewController {
  private reviewService = new ReviewService();

  public createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id as string; 
      const body = req.body;

      const data = await this.reviewService.createReview(userId, body);

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
