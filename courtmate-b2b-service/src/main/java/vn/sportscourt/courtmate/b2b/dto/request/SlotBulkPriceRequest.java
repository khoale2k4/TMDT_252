package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** PATCH /admin/courts/{courtId}/slots/bulk-update-price */
@Data
public class SlotBulkPriceRequest {
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

    @JsonProperty("apply_to_days")
    private List<String> applyToDays;

    @JsonProperty("new_price")
    @NotNull @Positive
    private Integer newPrice;
}
