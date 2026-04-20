package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class VenueBookingListResponse {
    private List<BookingDetail> bookings;
    private PaginationMeta pagination;
    private BookingSummary summary;

    @Data @Builder
    public static class BookingDetail {
        @JsonProperty("booking_id")
        private UUID bookingId;

        private CustomerInfo customer;
        private CourtInfo court;
        private SlotInfo slot;

        @JsonProperty("booking_type")
        private String bookingType;

        private BookingStatus status;

        @JsonProperty("total_amount")
        private Integer totalAmount;

        @JsonProperty("payment_status")
        private String paymentStatus;

        @JsonProperty("has_add_ons")
        private boolean hasAddOns;

        @JsonProperty("has_delivery")
        private boolean hasDelivery;

        @JsonProperty("created_at")
        private OffsetDateTime createdAt;
    }

    @Data @Builder
    public static class CustomerInfo {
        @JsonProperty("user_id")
        private UUID userId;

        @JsonProperty("full_name")
        private String fullName;

        private String phone;
    }

    @Data @Builder
    public static class CourtInfo {
        @JsonProperty("court_id")
        private UUID courtId;

        @JsonProperty("court_name")
        private String courtName;

        @JsonProperty("sport_type")
        private String sportType;
    }

    @Data @Builder
    public static class SlotInfo {
        private LocalDate date;

        @JsonProperty("start_time")
        private LocalTime startTime;

        @JsonProperty("end_time")
        private LocalTime endTime;
    }

    @Data @Builder
    public static class PaginationMeta {
        private int page;
        private long total;
        @JsonProperty("total_pages")
        private int totalPages;
    }

    @Data @Builder
    public static class BookingSummary {
        @JsonProperty("total_confirmed")
        private long totalConfirmed;

        @JsonProperty("total_cancelled")
        private long totalCancelled;

        @JsonProperty("total_pending")
        private long totalPending;

        @JsonProperty("total_revenue")
        private long totalRevenue;
    }
}
