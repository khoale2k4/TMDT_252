package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;

/** PATCH /admin/courts/{courtId}/slots/bulk-set-status */
@Data
public class SlotBulkStatusRequest {

    @JsonProperty("date_from")
    @NotNull
    private LocalDate dateFrom;

    @JsonProperty("date_to")
    @NotNull
    private LocalDate dateTo;

    @JsonProperty("time_from")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime timeFrom;

    @JsonProperty("time_to")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime timeTo;

    @JsonProperty("new_status")
    @NotNull(message = "Trạng thái mới không được để trống")
    private SlotStatus newStatus;

    private String reason;
}
