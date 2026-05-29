import { CheckoutRepository } from '../repositories/checkoutRepository';
import prisma from '../config/prisma';

export class CheckoutService {
  private checkoutRepo = new CheckoutRepository();

  public async processCheckout(userId: string, body: any) {
    const { booking_items, add_ons = [], delivery, payment_method, coupon_code } = body;
    
    // 1. Lấy dữ liệu từ DB qua Repository
    const slotIds = booking_items.map((item: any) => item.slot_id);
    const slots = await prisma.slot.findMany({
      where: { id: { in: slotIds } }
    });

    if (!slots || slots.length !== slotIds.length) {
      throw { status: 404, error: { code: "NOT_FOUND", message: "Không tìm thấy một số Slot." } };
    }

    // 2. Validate thời gian và token giữ chỗ
    const now = new Date();
    for (const slot of slots) {
      const item = booking_items.find((i: any) => i.slot_id === slot.id);
      if (
        slot.status !== 'locked' || 
        slot.locked_by !== userId || 
        slot.lock_token !== item?.lock_token || 
        (slot.locked_until && slot.locked_until < now)
      ) {
        throw {
          status: 400,
          error: { code: "LOCK_EXPIRED", message: `Thời gian giữ chỗ đã hết cho một số slot. Vui lòng chọn lại.` }
        };
      }
    }

    // 3. Tính toán tiền bạc (Mock dữ liệu)
    const slotPrice = slots.reduce((sum, slot) => sum + slot.price, 0);
    
    let addOnsTotal = 0;
    add_ons.forEach((addon: any) => {
      addOnsTotal += addon.quantity * 50000; // Giả lập mỗi món giá 50k
    });

    const deliveryFee = (delivery && delivery.required) ? 25000 : 0;
    const discount = coupon_code === 'SUMMER2025' ? (slotPrice * 0.1) * -1 : 0; // Giảm 10%
    const subtotal = slotPrice + addOnsTotal;
    const vat = Math.round((subtotal + deliveryFee + discount) * 0.08); // VAT 8%
    const total = subtotal + deliveryFee + discount + vat;

    // 4. Lưu vào Database thông qua Repository
    const booking = await this.checkoutRepo.createBookingTransaction(
      userId, 
      slotIds, 
      payment_method, 
      total
    );

    // 5. Trả về đúng format JSON như đặc tả
    return {
      checkout_id: booking.id,
      status: booking.status,
      expires_at: new Date(now.getTime() + 15 * 60000).toISOString(),
      line_items: {
        booking_fees: slots.map(slot => ({
          slot_id: slot.id,
          description: `Sân · ${slot.start_time}-${slot.end_time} · ${slot.date}`,
          price: slot.price
        })),
        add_ons: add_ons.map((a: any) => ({
          product_id: a.product_id,
          name: "Sản phẩm đính kèm",
          unit_price: 50000,
          quantity: a.quantity,
          subtotal: a.quantity * 50000
        })),
        delivery_fee: deliveryFee,
        discount: discount
      },
      pricing_summary: {
        subtotal, add_ons: addOnsTotal, delivery_fee: deliveryFee, discount, vat, total, currency: "VND"
      },
      payment: {
        method: payment_method,
        payment_url: `https://payment.momo.vn/pay?token=mock_tk_${booking.id}`
      }
    };
  }

  public async processRecurringCheckout(userId: string, body: any) {
    const { venue_id, court_id, start_date, end_date, days_of_week, start_time, end_time, payment_method } = body;
    
    // Convert dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    const requestedDates: string[] = [];

    // Find all matching dates
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // getDay(): 0 is Sunday, 1 is Monday...
      if (days_of_week.includes(d.getDay())) {
        requestedDates.push(d.toISOString().split('T')[0]);
      }
    }

    // Check all slots
    // Using global prisma instance
    const existingSlots = await prisma.slot.findMany({
      where: {
        court_id,
        date: { in: requestedDates },
        start_time,
        end_time
      }
    });

    const bookedSlots = [];
    const conflictedSlots = [];
    let totalPrice = 0;

    for (const date of requestedDates) {
      const slot = existingSlots.find((s: any) => s.date === date);
      if (slot && slot.status === 'available') {
        bookedSlots.push(slot);
        totalPrice += slot.price;
      } else {
        conflictedSlots.push(date);
      }
    }

    // If no slots available
    if (bookedSlots.length === 0) {
       throw { status: 400, error: { message: "No available slots found for the given schedule." } };
    }

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        user_id: userId,
        status: 'pending_payment',
        payment_method: payment_method || 'momo',
        total_amount: totalPrice
      }
    });

    // Update slots to locked/booked
    for (const slot of bookedSlots) {
       await prisma.slot.update({
         where: { id: slot.id },
         data: {
           status: 'locked',
           locked_by: userId,
           booking_id: booking.id,
           locked_until: new Date(Date.now() + 10 * 60000) // 10 mins lock
         }
       });
    }

    return {
      booking_id: booking.id,
      total_amount: totalPrice,
      booked_slots_count: bookedSlots.length,
      conflicted_dates: conflictedSlots,
      message: `Successfully reserved ${bookedSlots.length} slots. ${conflictedSlots.length} slots were skipped due to conflicts.`
    };
  }

  public async getBookingHistory(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        slots: {
          include: {
            court: {
              include: {
                venue: true
              }
            }
          }
        },
        review: true
      }
    });

    return bookings;
  }
}