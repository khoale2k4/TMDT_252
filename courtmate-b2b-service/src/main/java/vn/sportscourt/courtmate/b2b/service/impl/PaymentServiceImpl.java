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

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final MisaService misaService;
    private final PaymentRepository paymentRepository;
    private final BookingStateMachineService stateMachineService;
    @Transactional
    public void processPaymentSuccess(PaymentRequest request) {
        // 2. Kiểm tra trùng lặp
//        if (invoiceRepository.existsById(request.getOrderId())) {
//            return;
//        }
//
//        // 4 & 5. Update DB
//        bookingRepository.updateStatus(request.getOrderId(), BookingStatus.confirmed, request.getTransId());
        Optional<Booking> tmp = bookingRepository.findById(request.getOrderId());
        Booking temp = tmp.get();
        
        BookingStatus newStatus = stateMachineService.transition(temp.getId(), temp.getStatus(), BookingEvent.PAY);
        temp.setStatus(newStatus);
        
        bookingRepository.save(temp);
        Payment a = paymentRepository.findByBooking_Id(request.getOrderId());
        System.out.println(a.getId());
        a.setStatus(PaymentStatus.paid);
        a.setProviderTransactionId(request.getTransId());
        paymentRepository.save(a);

        System.out.println(request);
        // 7. Gọi Ahamove (Sử dụng RestTemplate hoặc WebClient)
//        callAhamoveApi(request);

        // 8. Gọi MISA meInvoice
//        MisaResponse misa = misaService.callMisaApi(request);
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
