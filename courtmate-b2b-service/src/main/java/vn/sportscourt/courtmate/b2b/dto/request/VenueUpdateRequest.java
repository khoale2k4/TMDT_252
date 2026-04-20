package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VenueUpdateRequest {

    private String name;
    private String description;
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
    private VenueRequest.WorkingHours workingHours;

    private List<String> amenities;

    @JsonProperty("bank_account")
    @Valid
    private VenueRequest.BankAccount bankAccount;
}
