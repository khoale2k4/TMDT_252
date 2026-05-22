package vn.sportscourt.courtmate.b2b.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PaymentRequest {
    private UUID orderId;     // Mã đơn hàng của bạn
    private String transId;     // Mã giao dịch của MoMo
    private Long amount;        // Số tiền
    private Integer resultCode; // 0: Thành công, khác 0: Thất bại
    private String message;     // Thông báo từ Provider

    // Bạn có thể thêm các field khác tùy theo tài liệu của MoMo/ZaloPay
    private String extraData;
//    private String orderInfo;
}
