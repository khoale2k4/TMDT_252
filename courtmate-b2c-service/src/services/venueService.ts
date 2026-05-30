import * as venueRepository from '../repositories/venueRepository';
import prisma from '../config/prisma';

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
    lat: query.lat ? parseFloat(query.lat as string) : undefined,
    lng: query.lng ? parseFloat(query.lng as string) : undefined,
    radiusKm: query.radius_km ? Math.min(parseFloat(query.radius_km as string), 50) : undefined,
    minLat: query.min_lat ? parseFloat(query.min_lat as string) : undefined,
    maxLat: query.max_lat ? parseFloat(query.max_lat as string) : undefined,
    minLng: query.min_lng ? parseFloat(query.min_lng as string) : undefined,
    maxLng: query.max_lng ? parseFloat(query.max_lng as string) : undefined,
    sportTypes: query.sport_types ? (query.sport_types as string).split(',') : undefined,
    sortBy: query.sort_by as string,
    limit,
    offset
  };

  const { venues, total } = await venueRepository.findNearbyVenues(repoParams);

  // Lấy rating thực tế từ bảng Review
  const venueIds = venues.map((v: RawVenueRecord) => v.venue_id);
  const reviewStats = await prisma.review.groupBy({
    by: ['venue_id'],
    where: { venue_id: { in: venueIds } },
    _count: {
      _all: true
    },
    _avg: {
      rating: true
    }
  });

  const statsMap = new Map(reviewStats.map(s => [
    s.venue_id, 
    {
      total_reviews: s._count._all,
      rating_avg: s._avg.rating ? Number(s._avg.rating.toFixed(1)) : 0
    }
  ]));

  // 2. Ép kiểu (v: RawVenueRecord) để TypeScript nhận diện đúng
  const formattedVenues = venues.map((v: RawVenueRecord) => {
    const stats = statsMap.get(v.venue_id) || { total_reviews: 0, rating_avg: 0 };
    return {
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
        average: stats.rating_avg,
        total_reviews: stats.total_reviews
      },
      cover_image_url: v.cover_image_url,
      is_open_now: true,
      next_available_slot: new Date().toISOString()
    };
  });

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

  // Lấy danh sách reviews thực tế từ database kèm thông tin user
  const dbReviews = await prisma.review.findMany({
    where: { venue_id: venueId },
    orderBy: { created_at: 'desc' }
  });

  const userIds = dbReviews.map(r => r.user_id);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, full_name: true }
  });
  
  const userMap = new Map(users.map(u => [u.id, u.full_name]));
  const reviewsWithUser = dbReviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    user_name: userMap.get(r.user_id) || "Người dùng CourtMate"
  }));

  const totalReviews = dbReviews.length;
  const ratingAvg = totalReviews > 0 
    ? Number((dbReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Format trả về đúng ý FE
  return {
    venues:
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
        average: ratingAvg,
        total_reviews: totalReviews
      },
      reviews: reviewsWithUser, // Trả thêm danh sách reviews động về cho FE
      cover_image_url: venue.cover_image_url,
      is_open_now: true,
      next_available_slot: nextSlot,
      description: venue.name.includes("Thống Nhất") 
        ? "Cụm sân Thống Nhất là điểm đến lý tưởng cho những người yêu thích thể thao. Sân được trang bị hệ thống chiếu sáng hiện đại, bãi đỗ xe rộng rãi, và căn tin phục vụ đầy đủ nước uống, đồ ăn nhẹ."
        : `Không gian đặt sân tại ${venue.name} được thiết kế chuyên nghiệp, thoáng mát với đầy đủ tiện ích đi kèm giúp bạn có những trải nghiệm vận động tuyệt vời nhất.`
    },
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
