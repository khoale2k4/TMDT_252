import prisma from '../config/prisma';

export class CheckoutRepository {
  // Tìm Slot bằng ID
  public async getSlotById(slotId: string) {
    return prisma.slot.findUnique({
      where: { id: slotId }
    });
  }

  // Sử dụng Transaction: Vừa tạo Booking, vừa Update trạng thái Slot cùng 1 lúc
  public async createBookingTransaction(userId: string, slotId: string, paymentMethod: string, totalAmount: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Tạo Booking mới
      const booking = await tx.booking.create({
        data: {
          user_id: userId,
          status: 'pending_payment',
          payment_method: paymentMethod,
          total_amount: totalAmount
        }
      });

      // 2. Cập nhật Slot
      await tx.slot.update({
        where: { id: slotId },
        data: {
          status: 'booked',
          booking_id: booking.id,
          locked_by: null,
          locked_until: null,
          lock_token: null // Đã checkout xong thì xóa token giữ chỗ
        }
      });

      return booking;
    });
  }
}