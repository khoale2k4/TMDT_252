package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import vn.sportscourt.courtmate.b2b.enums.CourtStatus;

import java.util.List;

/**
 * PUT  /admin/courts/{id}
 */
@Data
public class CourtUpdateRequest {
    @JsonProperty("court_name")
    private String name;

    @JsonProperty("sport_type")
    private String sportType;

    private String description;

    @JsonProperty("base_price")
    @Positive(message = "Giá cơ bản phải lớn hơn 0")
    private Integer basePrice;

    @JsonProperty("surface_type")
    private String surfaceType;

    @JsonProperty("has_lighting")
    private Boolean hasLighting;

    @JsonProperty("has_roof")
    private Boolean hasRoof;

    @JsonProperty("max_players")
    private Integer maxPlayers;

    private List<String> images;

    private CourtStatus status;
}
