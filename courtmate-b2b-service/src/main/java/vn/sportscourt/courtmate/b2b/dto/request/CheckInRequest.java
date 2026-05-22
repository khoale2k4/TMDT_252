package vn.sportscourt.courtmate.b2b.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** POST /admin/bookings/{booking_id}/checkin */
@Data
public class CheckInRequest {

    /** qr_scan | manual */
    @JsonProperty("checkin_method")
    private String checkinMethod = "manual";

    private String note;
}
