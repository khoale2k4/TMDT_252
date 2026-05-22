package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CancelBookingResponse {

    @JsonProperty("booking_id")
    private UUID bookingId;

    private String status;
    private RefundInfo refund;

    @JsonProperty("customer_notified")
    private boolean customerNotified;

    @JsonProperty("audit_log_id")
    private UUID auditLogId;

    @Data
    @Builder
    public static class RefundInfo {
        private String policy;
        private Integer amount;
        private String method;

        @JsonProperty("estimated_refund_time")
        private String estimatedRefundTime;
    }
}
