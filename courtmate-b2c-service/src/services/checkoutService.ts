import { CheckoutRepository } from '../repositories/checkoutRepository';

export class CheckoutService {
  private checkoutRepo = new CheckoutRepository();

  public async processCheckout(userId: string, body: any) {
    const { booking_items, add_ons = [], delivery, payment_method, coupon_code } = body;
    const item = booking_items[0];

    // 1. Lấy dữ liệu từ DB qua Repository
    const slot = await this.checkoutRepo.getSlotById(item.slot_id);

    if (!slot) {
      throw { status: 404, error: { code: "NOT_FOUND", message: "Không tìm thấy Slot." } };
    }

    // 2. Validate thời gian và token giữ chỗ
    const now = new Date();
    if (
      slot.status !== 'locked' || 
      slot.locked_by !== userId || 
      slot.lock_token !== item.lock_token || 
      (slot.locked_until && slot.locked_until < now)
    ) {
      throw {
        status: 400,
        error: { code: "LOCK_EXPIRED", message: `Thời gian giữ chỗ đã hết cho slot ${item.slot_id}. Vui lòng chọn lại.` }
      };
    }

    // 3. Tính toán tiền bạc (Mock dữ liệu)
    const slotPrice = slot.price;
    
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
      slot.id, 
      payment_method, 
      total
    );

    // 5. Trả về đúng format JSON như đặc tả
    return {
      checkout_id: booking.id,
      status: booking.status,
      expires_at: new Date(now.getTime() + 15 * 60000).toISOString(),
      line_items: {
        booking_fees: [{
          slot_id: slot.id,
          description: `Sân · ${slot.start_time}-${slot.end_time} · ${slot.date}`,
          price: slotPrice
        }],
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
}