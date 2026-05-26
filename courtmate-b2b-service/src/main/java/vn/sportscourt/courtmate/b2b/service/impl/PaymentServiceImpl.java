package vn.sportscourt.courtmate.b2b.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.sportscourt.courtmate.b2b.dto.request.PaymentRequest;
import vn.sportscourt.courtmate.b2b.dto.response.MisaResponse;
import vn.sportscourt.courtmate.b2b.entity.Booking;
import vn.sportscourt.courtmate.b2b.entity.Invoice;
import vn.sportscourt.courtmate.b2b.entity.Payment;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.enums.PaymentStatus;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.InvoiceRepository;
import vn.sportscourt.courtmate.b2b.repository.PaymentRepository;
import vn.sportscourt.courtmate.b2b.repository.PricingRulesRepository;
import vn.sportscourt.courtmate.b2b.service.MisaService;
import vn.sportscourt.courtmate.b2b.service.PaymentService;

import vn.sportscourt.courtmate.b2b.statemachine.BookingStateMachineService;
import vn.sportscourt.courtmate.b2b.events.BookingEvent;
import vn.sportscourt.courtmate.b2b.service.SseService;

import java.util.Optional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final MisaService misaService;
    private final PaymentRepository paymentRepository;
    private final BookingStateMachineService stateMachineService;
    private final SseService sseService;
    @Transactional
    public void processPaymentSuccess(PaymentRequest request) {
        // 2. Kiểm tra Idempotency (Tránh xử lý webhook nhiều lần)
        Optional<Booking> tmp = bookingRepository.findById(request.getOrderId());
        if (tmp.isEmpty()) {
            throw new RuntimeException("Booking not found: " + request.getOrderId());
        }
        
        Booking temp = tmp.get();
        if (temp.getStatus() == BookingStatus.confirmed || temp.getStatus() == BookingStatus.completed) {
            // Đã xử lý thành công trước đó -> Bỏ qua để Controller trả về HTTP 200
            System.out.println("Webhook Idempotency: Booking " + temp.getId() + " is already confirmed. Skipping.");
            return;
        }

        // 3. Xử lý TTL Expiration (Trễ Webhook)
        // Nếu slot đã bị mất do trễ 10 phút, thì trạng thái slot sẽ available.
        // Ở đây chúng ta tạm transition status. Nếu có lỗi (slot bị người khác lấy), 
        // sẽ cần handle đưa booking về trạng thái chờ đối soát.
        try {
            BookingStatus newStatus = stateMachineService.transition(temp.getId(), temp.getStatus(), BookingEvent.PAY);
            temp.setStatus(newStatus);
            bookingRepository.save(temp);
            
            if (temp.getVenue() != null) {
                sseService.sendEventToVenue(temp.getVenue().getId(), "UPDATE_BOOKING", 
                    Map.of("bookingId", temp.getId(), "status", newStatus.name()));
            }
        } catch (Exception e) {
            // Xử lý khi slot đã bị lấy / booking không thể transition sang CONFIRMED
            System.err.println("Lỗi Webhook trễ / Slot đã mất: " + e.getMessage());
            // TODO: Chuyển booking sang trạng thái chờ hoàn tiền/đối soát
            throw e;
        }
        Payment a = paymentRepository.findByBooking_Id(request.getOrderId());
        System.out.println(a.getId());
        a.setStatus(PaymentStatus.paid);
        a.setProviderTransactionId(request.getTransId());
        paymentRepository.save(a);

        System.out.println(request);
        // 7. Gọi Ahamove (Sử dụng RestTemplate hoặc WebClient)
//        callAhamoveApi(request);

        // 8. Gọi MISA meInvoice
        misaService.syncInvoice(temp, request);
//
//        // 9. Lưu thông tin hóa đơn
//        Invoice invoice = new Invoice();
//        invoice.setBooking(bookingRepository.findById(request.getOrderId()).get());
//        invoice.setMisaInvoiceNo(misa.getInvoiceNo());
//        invoice.setPdfUrl(misa.getPdfUrl());
//        invoiceRepository.save(invoice);

        // 10. Gửi Email
//        emailService.sendPaymentSuccessEmail(request.getEmail(), misa.getPdfUrl());
    }
}
