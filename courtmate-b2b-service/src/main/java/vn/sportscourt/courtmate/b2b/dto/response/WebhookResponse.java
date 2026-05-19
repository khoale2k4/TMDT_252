package vn.sportscourt.courtmate.b2b.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WebhookResponse {
    private Integer status;     // Thường là 0
    private String message;    // "success"
}