package vn.sportscourt.courtmate.b2b.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.sportscourt.courtmate.b2b.dto.request.PaymentRequest;
import vn.sportscourt.courtmate.b2b.dto.response.MisaResponse;
import vn.sportscourt.courtmate.b2b.entity.Booking;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MisaService {

    private static final Logger log = LoggerFactory.getLogger(MisaService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${misa.api.url}")
    private String misaApiUrl;

    @Value("${misa.api.token}")
    private String accessToken;

    @Async
    @CircuitBreaker(name = "misa", fallbackMethod = "syncInvoiceFallback")
    @Retry(name = "misa")
    public CompletableFuture<String> syncInvoice(Booking booking, PaymentRequest paymentRequest) {
        log.info("Starting MISA sync for booking: {}", booking.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> body = new HashMap<>();
        body.put("RefNo", paymentRequest.getOrderId());
        body.put("TransactionID", paymentRequest.getTransId());
        body.put("Amount", paymentRequest.getAmount());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<MisaResponse> response = restTemplate.postForEntity(
                    misaApiUrl + "/api/v1/invoices",
                    entity,
                    MisaResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return CompletableFuture.completedFuture("SUCCESS");
            } else {
                throw new RuntimeException("Lỗi khi gọi MISA: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("MISA API Connection Error: {}", e.getMessage());
            throw new RuntimeException("MISA API Connection Error: " + e.getMessage());
        }
    }

    public CompletableFuture<String> syncInvoiceFallback(Booking booking, PaymentRequest paymentRequest, Throwable t) {
        log.warn("Fallback triggered for MISA sync (Booking: {}). Reason: {}", booking.getId(), t.getMessage());
        return CompletableFuture.completedFuture("SYNC_FAILED_FALLBACK");
    }
}
