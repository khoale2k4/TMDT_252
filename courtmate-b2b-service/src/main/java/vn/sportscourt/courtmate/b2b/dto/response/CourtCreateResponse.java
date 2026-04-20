package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CourtCreateResponse {
    @JsonProperty("court_id")   private UUID courtId;
    @JsonProperty("court_name") private String courtName;
    @JsonProperty("venue_id")   private UUID venueId;
    @JsonProperty("sport_type") private String sportType;
    private String status;
    @JsonProperty("created_at") private OffsetDateTime createdAt;
}
