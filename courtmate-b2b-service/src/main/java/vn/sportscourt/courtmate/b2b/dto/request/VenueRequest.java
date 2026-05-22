package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.VenueStatus;

import java.math.BigDecimal;
import java.util.List;

/**
 * POST /admin/venues
 * PUT  /admin/venues/{id}
 */
@Data
public class VenueRequest {

    @NotBlank(message = "Tên venue không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @DecimalMin(value = "8.0", message = "Vĩ độ không nằm trong lãnh thổ Việt Nam.")
    @DecimalMax(value = "24.0", message = "Vĩ độ không nằm trong lãnh thổ Việt Nam.")
    private BigDecimal lat;

    @DecimalMin(value = "102.0", message = "Kinh độ không nằm trong lãnh thổ Việt Nam.")
    @DecimalMax(value = "115.0", message = "Kinh độ không nằm trong lãnh thổ Việt Nam.")
    private BigDecimal lng;

    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;

    @JsonProperty("working_hours")
    @Valid
    private WorkingHours workingHours;

    private List<String> amenities;

    @JsonProperty("bank_account")
    @Valid
    private BankAccount bankAccount;

    @Data
    public static class WorkingHours {
        private DaySchedule weekday;
        private DaySchedule weekend;

        @Data
        public static class DaySchedule {
            private String open;
            private String close;
        }
    }

    @Data
    public static class BankAccount {
        @JsonProperty("bank_name")     private String bankName;
        @JsonProperty("account_number") private String accountNumber;
        @JsonProperty("account_holder") private String accountHolder;
    }
}
