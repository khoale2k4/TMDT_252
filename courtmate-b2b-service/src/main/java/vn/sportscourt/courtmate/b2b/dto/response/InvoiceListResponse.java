package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class InvoiceListResponse {
    private List<InvoiceSummary> invoices;
    private PaginationMeta pagination;

    @Data @Builder
    public static class InvoiceSummary {
        @JsonProperty("invoice_id") private UUID invoiceId;
        @JsonProperty("booking_id") private UUID bookingId;
        @JsonProperty("misa_invoice_no") private String misaInvoiceNo;
        @JsonProperty("buyer_name") private String buyerName;
        private Integer total;
        private String status;
        @JsonProperty("pdf_url") private String pdfUrl;
        @JsonProperty("issued_at") private OffsetDateTime issuedAt;
    }

    @Data @Builder
    public static class PaginationMeta {
        private int page;
        private long total;
        @JsonProperty("total_pages")
        private int totalPages;
    }
}
