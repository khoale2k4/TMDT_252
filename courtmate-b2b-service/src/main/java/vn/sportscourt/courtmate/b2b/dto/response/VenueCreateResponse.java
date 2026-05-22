package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class VenueCreateResponse {
    @JsonProperty("venue_id")  private UUID venueId;
    private String name;
    private String slug;
    private String status;
    @JsonProperty("created_at") private OffsetDateTime createdAt;
}
