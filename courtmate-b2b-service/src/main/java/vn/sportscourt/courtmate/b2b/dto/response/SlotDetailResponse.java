package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class SlotDetailResponse {
    @JsonProperty("slot_id")
    private UUID slotId;

    @JsonProperty("court_id")
    private UUID courtId;

    @JsonProperty("court_name")
    private String courtName;

    private LocalDate date;

    @JsonProperty("start_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonProperty("end_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private SlotStatus status;
    private Integer price;
    private Integer version;
}
