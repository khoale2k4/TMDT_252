package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MisaResponse {
    @JsonProperty("invoice_no")
    private String invoiceNo;   // Số hóa đơn (VD: 0000001)

    @JsonProperty("pdf_url")
    private String pdfUrl;      // Đường dẫn tải hóa đơn PDF

    private String status;      // Trạng thái từ MISA
    private String errorCode;
}