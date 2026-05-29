import prisma from '../config/prisma';

export class ReviewService {
  public async createReview(userId: string, body: any) {
    const { booking_id, venue_id, rating, comment } = body;

    if (!booking_id || !venue_id || !rating) {
      throw { status: 400, error: { message: "Vui lòng cung cấp đủ booking_id, venue_id và rating." } };
    }

    if (rating < 1 || rating > 5) {
      throw { status: 400, error: { message: "Rating phải từ 1 đến 5." } };
    }

    // Kiểm tra Booking có tồn tại và thuộc về user không
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id }
    });

    if (!booking) {
      throw { status: 404, error: { message: "Không tìm thấy hóa đơn." } };
    }

    if (booking.user_id !== userId) {
      throw { status: 403, error: { message: "Bạn không có quyền đánh giá hóa đơn này." } };
    }

    // Kiểm tra trạng thái Booking (chỉ cho phép paid hoặc success)
    if (booking.status === 'pending_payment') {
      throw { status: 400, error: { message: "Bạn chỉ có thể đánh giá sau khi thanh toán thành công." } };
    }

    // Kiểm tra xem đã review chưa
    const existingReview = await prisma.review.findUnique({
      where: { booking_id }
    });

    if (existingReview) {
      throw { status: 400, error: { message: "Bạn đã đánh giá hóa đơn này rồi." } };
    }

    // Tạo Review và cập nhật Venue trong 1 Transaction
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          booking_id,
          user_id: userId,
          venue_id,
          rating,
          comment
        }
      });

      const venue = await tx.venue.findUnique({
        where: { id: venue_id }
      });

      if (venue) {
        const newTotalReviews = venue.total_reviews + 1;
        const newRatingAvg = ((venue.rating_avg * venue.total_reviews) + rating) / newTotalReviews;

        await tx.venue.update({
          where: { id: venue_id },
          data: {
            total_reviews: newTotalReviews,
            rating_avg: Number(newRatingAvg.toFixed(1))
          }
        });
      }

      return newReview;
    });

    return review;
  }
}
