package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.PaymentRequest;

public interface PaymentService {
    void processPaymentSuccess(PaymentRequest request);
}
