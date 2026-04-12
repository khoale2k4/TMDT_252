import * as venueRepository from '../repositories/venueRepository';

// 1. Khai báo Interface mô tả cấu trúc dữ liệu trả về từ Raw SQL
interface RawVenueRecord {
  venue_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  sport_types: string[];
  amenities: string[];
  cover_image_url: string | null;
  min_price: number;
  max_price: number;
  rating_avg: number;
  total_reviews: number;
  distance_km: number;
}

export const getNearbyVenuesService = async (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 20, 50); 
  const offset = (page - 1) * limit;

  const repoParams: venueRepository.NearbyVenueParams = {
    lat: parseFloat(query.lat as string),
    lng: parseFloat(query.lng as string),
    radiusKm: Math.min(parseFloat(query.radius_km as string), 50), 
    sportTypes: query.sport_types ? (query.sport_types as string).split(',') : undefined,
    sortBy: query.sort_by as string,
    limit,
    offset
  };

  const { venues, total } = await venueRepository.findNearbyVenues(repoParams);

  // 2. Ép kiểu (v: RawVenueRecord) để TypeScript nhận diện đúng
  const formattedVenues = venues.map((v: RawVenueRecord) => ({
    venue_id: v.venue_id,
    name: v.name,
    address: v.address,
    distance_km: parseFloat(v.distance_km.toFixed(2)),
    sport_types: v.sport_types,
    amenities: v.amenities,
    courts_available: 3, 
    price_range: {
      min: v.min_price,
      max: v.max_price
    },
    rating: {
      average: v.rating_avg,
      total_reviews: v.total_reviews
    },
    cover_image_url: v.cover_image_url,
    is_open_now: true, 
    next_available_slot: new Date().toISOString() 
  }));

  return {
    venues: formattedVenues,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };
};