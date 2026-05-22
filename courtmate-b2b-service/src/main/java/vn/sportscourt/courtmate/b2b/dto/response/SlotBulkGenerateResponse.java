package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SlotBulkGenerateResponse {

    @JsonProperty("court_id") private UUID courtId;
    @JsonProperty("created_count") private int createdCount;
    @JsonProperty("skipped_count") private int skippedCount;
    @JsonProperty("failed_count") private int failedCount;
    @JsonProperty("date_range") private DateRange dateRange;

    private List<SlotPreview> preview;
    private String message;

    @Data
    @Builder
    public static class DateRange {
        private LocalDate from;
        private LocalDate to;
    }

    @Data
    @Builder
    public static class SlotPreview {
        private LocalDate date;

        @JsonProperty("start_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonProperty("end_time")
        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        private int price;
    }
}
