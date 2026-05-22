package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * POST /admin/bookings/{booking_id}/cancel
 */
@Data
public class CancelBookingRequest {
    private String reason;

    /** full | partial | none */
    @JsonProperty("refund_policy")
    private String refundPolicy = "none";

    /** Bắt buộc nếu refund_policy = partial */
    @JsonProperty("refund_amount")
    private Integer refundAmount;

    @JsonProperty("notify_customer")
    private boolean notifyCustomer = false;
}
