import { Request, Response, NextFunction } from 'express';
import * as venueService from '../services/venueService';
import prisma from '../config/prisma';

export const getNearby = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius_km } = req.query;

    // Validate bắt buộc
    if (!lat || !lng || !radius_km) {
      return res.status(400).json({
        error: {
          code: "MISSING_PARAMETERS",
          message: "Vui lòng cung cấp đầy đủ lat, lng và radius_km."
        }
      });
    }

    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusNum = parseFloat(radius_km as string);

    // Validate tọa độ
    if (isNaN(latNum) || latNum < -90 || latNum > 90 || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        error: {
          code: "INVALID_COORDINATES",
          message: "Tọa độ không hợp lệ. lat phải trong khoảng [-90, 90] và lng trong khoảng [-180, 180]."
        }
      });
    }

    // Validate giới hạn bán kính tối đa 50km
    if (isNaN(radiusNum) || radiusNum < 0 || radiusNum > 50) {
       return res.status(400).json({
        error: {
          code: "INVALID_RADIUS",
          message: "Bán kính (radius_km) phải trong khoảng [0, 50]."
        }
      });
    }

    
    const result = await venueService.getNearbyVenuesService(req.query);

    return res.status(200).json({
      data: result
    });
  } catch (error) {
    next(error); 
  }
};

export const getVenueSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const venue_id = req.params.venue_id as string;
    const { date_from, date_to, sport_type } = req.query;

    if (!date_from || !date_to) {
      res.status(400).json({ error: 'Thiếu tham số bắt buộc: date_from hoặc date_to' });
      return;
    }

    const from = new Date(date_from as string);
    const to = new Date(date_to as string);
    
    if (from > to) {
      res.status(400).json({ error: 'Khoảng thời gian không hợp lệ: date_from không được lớn hơn date_to.' });
      return;
    }

    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      res.status(400).json({ error: 'Khoảng thời gian không được vượt quá 14 ngày' });
      return;
    }

    // ==========================================
    // BƯỚC FIX LỖI: LÀM SẠCH VÀ ÉP KIỂU SPORT_TYPE
    // ==========================================
    let parsedSportType: string | undefined = undefined;

    if (typeof sport_type === 'string') {
      // Trường hợp 1: Chắc chắn là 1 chuỗi hợp lệ
      parsedSportType = sport_type;
    } else if (Array.isArray(sport_type) && sport_type.length > 0) {
      // Trường hợp 2: Nếu user cố tình truyền mảng (?sport=A&sport=B), ta lấy cái đầu tiên
      parsedSportType = String(sport_type[0]);
    }

    // Truy vấn với Prisma
    const courts = await prisma.court.findMany({
      where: {
        venue_id: venue_id,
        
        ...(parsedSportType ? { sport_type: parsedSportType } : {})
      },
      include: {
        slots: {
          where: {
            date: {
              gte: date_from as string,
              lte: date_to as string
            }
          },
          orderBy: [
            { date: 'asc' },
            { start_time: 'asc' }
          ]
        }
      }
    });

    const responseData = {
      data: {
        venue_id: venue_id,
        courts: courts.map((court: any) => ({
          court_id: court.id,
          court_name: court.name,
          sport_type: court.sport_type,
          slots: court.slots.map((slot: any) => ({
            slot_id: slot.id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: slot.status,
            price: slot.price,
            version: slot.version
          }))
        }))
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Lỗi khi lấy slot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
