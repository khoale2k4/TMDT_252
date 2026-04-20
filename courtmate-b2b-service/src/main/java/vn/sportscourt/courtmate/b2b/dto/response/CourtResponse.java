package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.CourtStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CourtResponse {
    @JsonProperty("court_id")   private UUID courtId;
    @JsonProperty("venue_id")   private UUID venueId;
    @JsonProperty("venue_name") private String venueName;
    @JsonProperty("court_name") private String courtName;
    @JsonProperty("sport_type") private String sportType;
    private String description;
    @JsonProperty("base_price")   private Integer basePrice;
    @JsonProperty("surface_type") private String surfaceType;
    @JsonProperty("has_lighting") private Boolean hasLighting;
    @JsonProperty("has_roof")     private Boolean hasRoof;
    @JsonProperty("max_players")  private Integer maxPlayers;
    private List<String> images;
    private CourtStatus status;
    @JsonProperty("created_at") private OffsetDateTime createdAt;
    @JsonProperty("updated_at") private OffsetDateTime updatedAt;
}
