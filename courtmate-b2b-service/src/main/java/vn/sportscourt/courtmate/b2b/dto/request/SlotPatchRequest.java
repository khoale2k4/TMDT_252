package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * PATCH /admin/slots/{slot_id}
 * action: reschedule | set_maintenance | restore
 */
@Data
public class SlotPatchRequest {

    @JsonProperty("expected_version")
    @NotNull(message = "expected_version là bắt buộc để chống ghi đè dữ liệu")
    private Integer expectedVersion;

    /**
     * reschedule       – move slot to new_slot_id
     * set_maintenance  – mark slot maintenance
     * restore          – restore slot to available
     */
    @NotBlank
    private String action;

    /** Required when action = reschedule */
    @JsonProperty("new_slot_id")
    private java.util.UUID newSlotId;

    private String reason;

    @JsonProperty("notify_customer")
    private boolean notifyCustomer = false;
}
