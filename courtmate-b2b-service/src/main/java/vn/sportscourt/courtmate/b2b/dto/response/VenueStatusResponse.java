package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VenueStatusResponse {
    @JsonProperty("venue_id") private UUID venueId;
    @JsonProperty("old_status") private String oldStatus;
    @JsonProperty("new_status") private String newStatus;
    @JsonProperty("reopen_at") private String reopenAt;
    @JsonProperty("affected_bookings") private int affectedBookings;
    private String message;
}
