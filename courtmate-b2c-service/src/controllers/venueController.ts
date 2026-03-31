import { Request, Response, NextFunction } from 'express';
import * as venueService from '../services/venueService';

export const getNearbyVenues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius_km } = req.query;

    // Basic validation (can be moved to a dedicated validator middleware)
    if (!lat || !lng || !radius_km) {
      throw new Error('Missing required query parameters: lat, lng, radius_km');
    }

    const venues = await venueService.findNearbyVenues(
      Number(lat),
      Number(lng),
      Number(radius_km)
    );

    res.status(200).json({
      data: {
        venues,
      },
    });
  } catch (error) {
    next(error);
  }
};
