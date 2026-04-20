package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VenueStatusRequest {
    /** active | closed | suspended */
    @NotBlank
    private String status;

    private String reason;

    @JsonProperty("reopen_at")
    private String reopenAt;
}
