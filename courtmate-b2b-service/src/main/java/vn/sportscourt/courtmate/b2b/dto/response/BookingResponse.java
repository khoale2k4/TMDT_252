package vn.sportscourt.courtmate.b2b.dto.response;

import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID venueId;
    private String venueName;
    private BookingStatus status;
    private Integer totalAmount;
    private Integer discountAmount;
    private Integer taxAmount;
    private Integer finalAmount;
    private String notes;
    private List<BookingItemResponse> items;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    public static class BookingItemResponse {
        private UUID slotId;
        private String name;
        private java.time.LocalDate date;
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private Integer price;
    }
}
