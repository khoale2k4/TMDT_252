package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class SlotBulkGenerateRequest {

    @JsonProperty("date_from")
    @NotNull
    private LocalDate dateFrom;

    @JsonProperty("date_to")
    @NotNull
    private LocalDate dateTo;

    @JsonProperty("time_slots")
    @NotEmpty
    private List<TimeSlotRange> timeSlots;

    /** ["monday","tuesday",...] — empty = all days */
    @JsonProperty("apply_to_days")
    private List<String> applyToDays;

    @JsonProperty("base_price")
    @Positive(message = "Giá gốc phải lớn hơn 0")
    @NotNull
    private Integer basePrice;

    /** If true, skip duplicates. If false, throw on conflict. */
    @JsonProperty("skip_existing")
    private boolean skipExisting = true;

    @Data
    public static class TimeSlotRange {
        @NotNull @JsonFormat(pattern = "HH:mm") private LocalTime start;
        @NotNull @JsonFormat(pattern = "HH:mm") private LocalTime end;
    }
}
