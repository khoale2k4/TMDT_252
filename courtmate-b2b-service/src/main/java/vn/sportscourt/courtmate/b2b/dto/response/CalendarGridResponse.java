package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CalendarGridResponse {

    @JsonProperty("venue_id")
    private UUID venueId;

    private LocalDate date;

    private List<CourtColumn> courts;

    private GridSummary summary;

    @Data
    @Builder
    public static class GridSummary {
        @JsonProperty("total_slots")
        private int totalSlots;

        private int booked;
        private int available;
        private int locked;
        private int maintenance;

        @JsonProperty("occupancy_rate")
        private double occupancyRate;

        @JsonProperty("revenue_today")
        private long revenueToday;
    }

    @Data
    @Builder
    public static class CourtColumn {
        @JsonProperty("court_id")
        private UUID courtId;

        @JsonProperty("court_name")
        private String name;

        private List<SlotResponse> slots;
    }
}
