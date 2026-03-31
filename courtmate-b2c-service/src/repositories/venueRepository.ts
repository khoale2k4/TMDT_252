// This repository would normally use Prisma, but for now it returns mock data as requested.
import prisma from '../config/prisma';

export const getNearbyVenues = async (lat: number, lng: number, radiusKm: number) => {
  return [
    {
      venue_id: 'v_9f2a1b3c',
      name: 'Sân Pickleball Quận 7 Arena (Mock)',
      address: '123 Nguyễn Thị Thập, Quận 7, TP.HCM',
      distance_km: 1.24,
      sport_types: ['pickleball', 'badminton'],
      price_range: { min: 80000, max: 180000 },
      rating: { average: 4.7, total_reviews: 128 },
    },
    {
      venue_id: 'v_2e1f4d9a',
      name: 'Phú Thọ Stadium (Mock)',
      address: '219 Lý Thường Kiệt, Quận 11, TP.HCM',
      distance_km: 3.5,
      sport_types: ['badminton'],
      price_range: { min: 60000, max: 120000 },
      rating: { average: 4.5, total_reviews: 512 },
    },
  ];
};
