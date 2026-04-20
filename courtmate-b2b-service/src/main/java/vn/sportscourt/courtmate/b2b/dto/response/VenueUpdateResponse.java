package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class VenueUpdateResponse {
    @JsonProperty("venue_id")       private UUID venueId;
    @JsonProperty("updated_fields") private List<String> updatedFields;
    @JsonProperty("updated_at")     private OffsetDateTime updatedAt;
}
