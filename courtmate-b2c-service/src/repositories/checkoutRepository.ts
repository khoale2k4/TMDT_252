import prisma from '../config/prisma';

export class CheckoutRepository {
  // Tìm Slot bằng ID
  public async getSlotById(slotId: string) {
    return prisma.slot.findUnique({
      where: { id: slotId }
    });
  }

  public async createBookingTransaction(userId: string, slotIds: string[], paymentMethod: string, totalAmount: number) {
    return prisma.$transaction(async (tx) => {
      // Find venue_id from the first slot
      const firstSlot = await tx.slot.findUnique({
        where: { id: slotIds[0] },
        include: { court: true }
      });
      const venueId = firstSlot?.court?.venue_id || null;

      // 1. Tạo Booking mới với status 'completed' (để khớp enum B2B và hiển thị doanh thu)
      const booking = await tx.booking.create({
        data: {
          user_id: userId,
          venue_id: venueId,
          status: 'completed',
          payment_method: paymentMethod,
          total_amount: totalAmount,
          final_amount: totalAmount
        }
      });

      // 2. Cập nhật Slot
      await tx.slot.updateMany({
        where: { id: { in: slotIds } },
        data: {
          status: 'booked',
          booking_id: booking.id,
          locked_by: null,
          locked_until: null,
          lock_token: null // Đã checkout xong thì xóa token giữ chỗ
        }
      });

      // 3. Tạo hóa đơn MISA tương ứng tự động
      await tx.invoice.create({
        data: {
          booking_id: booking.id,
          misa_invoice_no: `MISA-${booking.id.substring(0, 8).toUpperCase()}`,
          pdf_url: `/invoices/misa_${booking.id.substring(0, 8)}.pdf`,
          status: 'synced'
        }
      });

      return booking;
    });
  }
}