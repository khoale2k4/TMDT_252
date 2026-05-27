import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class AdminController {
  public getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const venues = await prisma.venue.findMany({
        where: { owner_id: userId }
      });
      const venueIds = venues.map(v => v.id);

      // Nếu muốn chính xác thì tính dựa trên Booking.
      // Ở đây ta mock 1 vài chỉ số cơ bản dựa trên DB thật.
      res.status(200).json({
        data: {
          totalRevenue: 24500000,
          totalBookings: 142,
          activeUsers: 89,
          growth: '+12.5%',
          totalVenues: venues.length
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public getVenues = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const venues = await prisma.venue.findMany({
        where: { owner_id: userId },
        include: {
          courts: true
        }
      });
      res.status(200).json({ data: venues });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public createVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { name, address, lat, lng, sport_types, amenities, cover_image_url, courts } = req.body;

      const newVenue = await prisma.venue.create({
        data: {
          owner_id: userId,
          name,
          address,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          sport_types: sport_types || [],
          amenities: amenities || [],
          cover_image_url: cover_image_url || null,
          min_price: 50000,
          max_price: 150000,
          courts: {
            create: courts.map((c: any) => ({
              name: c.name,
              sport_type: c.sport_type
            }))
          }
        },
        include: {
          courts: true
        }
      });

      res.status(201).json({ data: newVenue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public generateSlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const venueId = req.params.id;
      const { date, start_hour, end_hour, price } = req.body; // e.g. date: "2026-05-27", start: 8, end: 22

      // Xác minh quyền sở hữu
      const venue = await prisma.venue.findFirst({
        where: { id: venueId, owner_id: userId },
        include: { courts: true }
      });

      if (!venue) {
        res.status(403).json({ error: 'Forbidden or venue not found' });
        return;
      }

      const newSlots: any[] = [];
      const courts = venue.courts;

      for (const court of courts) {
        for (let hour = start_hour; hour < end_hour; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

          newSlots.push({
            court_id: court.id,
            date,
            start_time: startTime,
            end_time: endTime,
            status: 'available',
            price: price || 60000
          });
        }
      }

      const created = await prisma.slot.createMany({
        data: newSlots,
        skipDuplicates: true
      });

      res.status(201).json({ data: { count: created.count } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
