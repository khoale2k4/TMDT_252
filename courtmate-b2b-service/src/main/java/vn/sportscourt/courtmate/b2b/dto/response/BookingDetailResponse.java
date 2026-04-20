package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BookingDetailResponse {
    @JsonProperty("booking_id")
    private UUID bookingId;

    private CustomerInfo customer;
    private CourtInfo court;
    private SlotInfo slot;

    @JsonProperty("booking_type")
    private String bookingType;

    private BookingStatus status;
    private PaymentInfo payment;

    @JsonProperty("add_ons")
    private List<AddOnInfo> addOns;

    private DeliveryInfo delivery;
    private InvoiceInfo invoice;
    private String notes;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    // ── Nested Classes ────────────────────────────────────────────────────────

    @Data @Builder
    public static class CustomerInfo {
        @JsonProperty("user_id") private UUID userId;
        @JsonProperty("full_name") private String fullName;
        private String phone;
        private String email;
        @JsonProperty("total_bookings") private long totalBookings;
    }

    @Data @Builder
    public static class CourtInfo {
        @JsonProperty("court_id") private UUID courtId;
        @JsonProperty("court_name") private String courtName;
        @JsonProperty("venue_name") private String venueName;
        @JsonProperty("sport_type") private String sportType;
    }

    @Data @Builder
    public static class SlotInfo {
        @JsonProperty("slot_id") private UUID slotId;
        private LocalDate date;
        @JsonProperty("start_time") @JsonFormat(pattern = "HH:mm") private LocalTime startTime;
        @JsonProperty("end_time") @JsonFormat(pattern = "HH:mm") private LocalTime endTime;
    }

    @Data @Builder
    public static class PaymentInfo {
        private String method;
        private String status;
        private Integer amount;
        @JsonProperty("transaction_id") private String transactionId;
        @JsonProperty("paid_at") private OffsetDateTime paidAt;
    }

    @Data @Builder
    public static class AddOnInfo {
        @JsonProperty("product_id") private String productId;
        private String name;
        private int quantity;
        @JsonProperty("unit_price") private int unitPrice;
        private int subtotal;
    }

    @Data @Builder
    public static class DeliveryInfo {
        private String status;
        private String address;
        @JsonProperty("ahamove_order_id") private String ahamoveOrderId;
        @JsonProperty("delivered_at") private OffsetDateTime deliveredAt;
    }

    @Data @Builder
    public static class InvoiceInfo {
        @JsonProperty("invoice_id") private String invoiceId;
        @JsonProperty("misa_invoice_no") private String misaInvoiceNo;
        @JsonProperty("pdf_url") private String pdfUrl;
    }
}
