package vn.sportscourt.courtmate.b2b.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.sportscourt.courtmate.b2b.dto.request.PaymentRequest;
import vn.sportscourt.courtmate.b2b.dto.response.MisaResponse;

import java.util.HashMap;
import java.util.Map;

@Service
public class MisaService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${misa.api.url}")
    private String misaApiUrl;

    @Value("${misa.api.token}")
    private String accessToken;

    public MisaResponse callMisaApi(PaymentRequest paymentRequest) {
        // 1. Chuẩn bị Header (MISA thường yêu cầu Token và Content-Type)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // 2. Chuẩn bị Body dựa trên tài liệu API của MISA meInvoice
        // Lưu ý: Bạn cần map dữ liệu từ paymentRequest sang định dạng MISA yêu cầu
        Map<String, Object> body = new HashMap<>();
        body.put("RefNo", paymentRequest.getOrderId()); // Số chứng từ
        body.put("TransactionID", paymentRequest.getTransId());
        body.put("Amount", paymentRequest.getAmount());
        // ... thêm các thông tin khách hàng, hàng hóa khác lấy từ Database dựa vào OrderId

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // 3. Thực hiện lệnh POST sang MISA
            ResponseEntity<MisaResponse> response = restTemplate.postForEntity(
                    misaApiUrl + "/api/v1/invoices",
                    entity,
                    MisaResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("Lỗi khi gọi MISA: " + response.getStatusCode());
            }
        } catch (Exception e) {
            // Log lỗi và xử lý
            throw new RuntimeException("MISA API Connection Error: " + e.getMessage());
        }
    }
}
