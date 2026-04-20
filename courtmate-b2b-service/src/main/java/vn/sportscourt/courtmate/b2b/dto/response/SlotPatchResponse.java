package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SlotPatchResponse {

    @JsonProperty("slot_id")
    private UUID slotId;

    @JsonProperty("new_slot_id")
    private UUID newSlotId;

    private String action;

    @JsonProperty("new_version")
    private int newVersion;

    @JsonProperty("audit_log_id")
    private UUID auditLogId;

    @JsonProperty("customer_notified")
    private boolean customerNotified;

    private String message;
}
