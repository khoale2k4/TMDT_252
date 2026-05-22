package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class InvoiceResponse {

    @JsonProperty("invoice_id")
    private UUID id;

    @JsonProperty("booking_id")
    private UUID bookingId;

    @JsonProperty("misa_invoice_no")
    private String misaInvoiceNo;

    @JsonProperty("pdf_url")
    private String pdfUrl;

    private String status;

    @JsonProperty("issued_at")
    private OffsetDateTime issuedAt;
}
