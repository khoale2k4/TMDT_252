package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

/**
 * POST /admin/venues/{id}/courts
 */
@Data
public class CourtRequest {

    @JsonProperty("court_name")
    @NotBlank(message = "Tên sân không được để trống")
    private String name;

    @JsonProperty("sport_type")
    @NotBlank(message = "Loại môn thể thao không được để trống")
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
}
