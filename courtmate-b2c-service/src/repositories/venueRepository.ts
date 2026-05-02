import prisma from '../config/prisma';

export interface NearbyVenueParams {
  lat: number;
  lng: number;
  radiusKm: number;
  sportTypes?: string[];
  sortBy?: string;
  limit: number;
  offset: number;
}

export const findNearbyVenues = async (params: NearbyVenueParams) => {
  const { lat, lng, radiusKm, sportTypes, sortBy, limit, offset } = params;

  // Công thức Haversine tính khoảng cách (km)
  const distanceCalc = `
    (6371 * acos(
      cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng})) + 
      sin(radians(${lat})) * sin(radians(lat))
    ))
  `;

  // Xây dựng điều kiện lọc động
  let whereClause = `WHERE ${distanceCalc} <= ${radiusKm}`;
  
  if (sportTypes && sportTypes.length > 0) {
    const formattedTypes = sportTypes.map(t => `'${t}'`).join(',');
    whereClause += ` AND sport_types && ARRAY[${formattedTypes}]::text[]`;
  }

  // Xây dựng điều kiện sắp xếp
  let orderByClause = `ORDER BY distance_km ASC`; // Mặc định sort_by = distance
  if (sortBy === 'price_asc') orderByClause = `ORDER BY min_price ASC`;
  if (sortBy === 'rating') orderByClause = `ORDER BY rating_avg DESC`;

  // Query Data
  const query = `
    SELECT 
      id as venue_id, name, address, lat, lng,
      sport_types, amenities, cover_image_url,
      min_price, max_price, rating_avg, total_reviews,
      ${distanceCalc} AS distance_km
    FROM "Venue"
    ${whereClause}
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Query Count để làm phân trang
  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM "Venue"
    ${whereClause}
  `;

  const [venues, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(query),
    prisma.$queryRawUnsafe<any[]>(countQuery)
  ]);

  return {
    venues,
    total: countResult[0]?.total || 0
  };
};
export const getVenueById = async (venueId: string) => {
  return prisma.venue.findUnique({
    where: { id: venueId }
  });
};

// Lấy tất cả Slot của Venue trong 1 ngày cụ thể
export const getSlotsByVenueAndDate = async (venueId: string, date: string) => {
  return prisma.slot.findMany({
    where: {
      date: date,
      court: {
        venue_id: venueId
      }
    },
    orderBy: [
      { start_time: 'asc' }
    ]
  });
};