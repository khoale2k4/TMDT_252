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
public class UpdatePriceSlotResponse {
    @JsonProperty("slot_id")
    private UUID id;

    private LocalDate date;

    @JsonProperty("start_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonProperty("end_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private SlotStatus status;

    @JsonProperty("base_price")
    private Integer price;

    @JsonProperty("dynamic_price")
    private Integer dynamicPrice;
    @JsonProperty("rules_applied")
    private String rulename;

    private Integer version;
}