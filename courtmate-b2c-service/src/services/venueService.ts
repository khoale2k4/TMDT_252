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

export const getVenueDetailService = async (venueId: string, dateQuery?: string) => {
  // Lấy venue
  const venue = await venueRepository.getVenueById(venueId);
  if (!venue) {
    throw { status: 404, message: "Không tìm thấy sân (Venue)." };
  }

  // Lấy slots (nếu FE không truyền date, tự lấy ngày hôm nay)
  const date = dateQuery || new Date().toISOString().split('T')[0];
  const slots = await venueRepository.getSlotsByVenueAndDate(venueId, date);

  const availableSlots = slots.filter((s: any) => s.status === 'available');
  
  const nextSlot = availableSlots.length > 0 
    ? `${availableSlots[0].date}T${availableSlots[0].start_time}:00+07:00` 
    : null;

  // Format trả về đúng ý FE
  return {
    venues: [
      {
        venue_id: venue.id,
        name: venue.name,
        address: venue.address,
        distance_km: 1.24, // Mock tĩnh
        sport_types: venue.sport_types,
        amenities: venue.amenities,
        courts_available: availableSlots.length,
        price_range: {
          min: venue.min_price,
          max: venue.max_price
        },
        rating: {
          average: venue.rating_avg,
          total_reviews: venue.total_reviews
        },
        cover_image_url: venue.cover_image_url,
        is_open_now: true, 
        next_available_slot: nextSlot
      }
    ],
    slots: slots.map((s: any) => ({
      slot_id: s.id,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status,
      price: s.price,
      version: s.version
    }))
  };
};