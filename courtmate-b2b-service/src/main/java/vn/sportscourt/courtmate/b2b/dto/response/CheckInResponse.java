package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CheckInResponse {

    @JsonProperty("booking_id")
    private UUID bookingId;

    @JsonProperty("checkin_status")
    private String checkinStatus;

    @JsonProperty("checkin_at")
    private OffsetDateTime checkinAt;

    @JsonProperty("checkin_by")
    private UUID checkinBy;

    @JsonProperty("customer_name")
    private String customerName;

    private SlotInfo slot;

    @Data
    @Builder
    public static class SlotInfo {
        @JsonProperty("court_name")
        private String name;

        @JsonProperty("start_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonProperty("end_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;
    }
}
