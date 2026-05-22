package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotRescheduleRequest {

    @NotNull(message = "Ngày không được để trống")
    @Future(message = "Ngày phải là ngày trong tương lai")
    private LocalDate newDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime newStartTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime newEndTime;

    @Positive(message = "Giá phải lớn hơn 0")
    private Integer newPrice;

    private String reason;
}
