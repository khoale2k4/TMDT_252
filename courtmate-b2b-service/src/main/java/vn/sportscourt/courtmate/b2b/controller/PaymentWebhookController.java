package vn.sportscourt.courtmate.b2b.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.PaymentRequest;
import vn.sportscourt.courtmate.b2b.dto.response.WebhookResponse;
import vn.sportscourt.courtmate.b2b.service.PaymentService;

@RestController
@RequestMapping("/api/webhooks")
public class PaymentWebhookController {

    @Value("${payment.momo.secret-key:default_momo_secret}")
    private String momoSecretKey;

    @Value("${payment.vietqr.secret-key:default_vietqr_secret}")
    private String vietqrSecretKey;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/payment/{provider}")
    public ResponseEntity<?> handlePaymentWebhook(
            @PathVariable String provider,
            @RequestHeader("X-Signature") String signature,
            @RequestBody String rawBody // Lấy string thô để tính toán chữ ký chính xác nhất
    ) {
        try {
            // 1. Xác minh HMAC-SHA256 tùy theo provider
            String activeSecretKey = provider.equalsIgnoreCase("vietqr") ? vietqrSecretKey : momoSecretKey;
            
            if (!verifySignature(rawBody, signature, activeSecretKey)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Signature");
            }
            System.out.println(1);
            // Parse JSON từ rawBody sang Object
            ObjectMapper mapper = new ObjectMapper();
            PaymentRequest request = mapper.readValue(rawBody, PaymentRequest.class);
            System.out.println(request);
            // 2. Kiểm tra resultCode (0 là thành công)
            if (request.getResultCode() != 0) {
                return ResponseEntity.ok(new WebhookResponse(0, "Transaction failed or cancelled"));
            }

            // 3 -> 10. Xử lý nghiệp vụ (Transaction, MISA, Ahamove)
            paymentService.processPaymentSuccess(request);

            // 11. Trả về 200 cho Provider
            return ResponseEntity.ok(new WebhookResponse(0, "success"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean verifySignature(String data, String signature, String key) {
        String calculatedSignature = new HmacUtils(HmacAlgorithms.HMAC_SHA_256, key).hmacHex(data);
        return calculatedSignature.equalsIgnoreCase(signature);
    }
}
