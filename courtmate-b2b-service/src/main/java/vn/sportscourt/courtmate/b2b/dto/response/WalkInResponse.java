package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class WalkInResponse {

    @JsonProperty("booking_id")
    private UUID bookingId;

    private String status;

    @JsonProperty("payment_status")
    private String paymentStatus;

    private SlotInfo slot;

    @JsonProperty("receipt_no")
    private String receiptNo;

    @Data
    @Builder
    public static class SlotInfo {
        @JsonProperty("court_name")
        private String name;

        private LocalDate date;

        @JsonProperty("start_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonProperty("end_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;
    }
}
