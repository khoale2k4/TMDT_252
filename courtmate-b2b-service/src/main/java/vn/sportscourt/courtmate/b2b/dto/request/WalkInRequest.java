package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * POST /admin/bookings/walk-in
 */
@Data
public class WalkInRequest {

    @JsonProperty("slot_id")
    @NotNull
    private UUID slotId;

    @JsonProperty("expected_version")
    @NotNull
    private Integer expectedVersion;

    private CustomerDetail customer;

    @JsonProperty("payment_method")
    private String paymentMethod = "cash";

    @JsonProperty("amount_paid")
    private Integer amountPaid;

    private String notes;

    @Data
    public static class CustomerDetail {
        @JsonProperty("full_name")
        private String fullName;

        private String phone;

        @JsonProperty("user_id")
        private UUID userId;
    }
}
