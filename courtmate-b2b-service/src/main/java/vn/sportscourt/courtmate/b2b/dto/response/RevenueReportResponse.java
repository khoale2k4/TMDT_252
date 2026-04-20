package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class RevenueReportResponse {

    @JsonProperty("venue_id")
    private UUID venueId;

    @JsonProperty("venue_name")
    private String venueName;

    private LocalDate from;
    private LocalDate to;

    @JsonProperty("total_revenue")
    private Long totalRevenue;         // VNĐ

    @JsonProperty("total_bookings")
    private Long totalBookings;

    @JsonProperty("completed_bookings")
    private Long completedBookings;

    @JsonProperty("cancelled_bookings")
    private Long cancelledBookings;
}
