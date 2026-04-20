package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.VenueStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class VenueResponse {
    @JsonProperty("venue_id")
    private UUID venueId;

    @JsonProperty("owner_id")
    private UUID ownerId;

    @JsonProperty("owner_name")
    private String ownerName;

    private String name;
    private String slug;
    private String description;
    private String phone;
    private String email;
    private String address;

    private BigDecimal lat;
    private BigDecimal lng;

    @JsonProperty("working_hours")
    private Map<String, Object> workingHours;

    private List<String> amenities;

    @JsonProperty("bank_account")
    private Map<String, Object> bankAccount;

    private VenueStatus status;

    @JsonProperty("rating_avg")
    private BigDecimal ratingAvg;

    @JsonProperty("total_reviews")
    private Integer totalReviews;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;
}
