package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.response.InvoiceListResponse;
import vn.sportscourt.courtmate.b2b.dto.response.InvoiceResponse;
import vn.sportscourt.courtmate.b2b.entity.Booking;
import vn.sportscourt.courtmate.b2b.entity.Invoice;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.InvoiceRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.InvoiceService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public InvoiceResponse issue(UUID bookingId, UUID requesterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Can only issue invoice for completed bookings
        if (booking.getStatus() != BookingStatus.completed) {
            throw new AppException(ErrorCode.BOOKING_INVALID_TRANSITION,
                    Map.of("reason", "Chỉ có thể xuất hoá đơn cho booking đã hoàn thành",
                            "currentStatus", booking.getStatus().name()));
        }

        // Idempotency: prevent duplicate invoice
        invoiceRepository.findByBooking_Id(bookingId).ifPresent(existing -> {
            throw new AppException(ErrorCode.INVOICE_ALREADY_ISSUED,
                    Map.of("invoiceId", existing.getId()));
        });

        // ── MISA meInvoice stub ──────────────────────────────────────────
        // TODO: replace with actual MISA API call when credentials are available
        // MisaInvoiceClient.issue(MisaInvoiceRequest.from(booking))
        String misaInvoiceNo = "INV-" + System.currentTimeMillis();
        String pdfUrl = "/invoices/" + misaInvoiceNo + ".pdf";
        log.info("[MISA STUB] Issued invoice {} for booking {}", misaInvoiceNo, bookingId);
        // ────────────────────────────────────────────────────────────────

        Invoice invoice = Invoice.builder()
                .booking(booking)
                .misaInvoiceNo(misaInvoiceNo)
                .pdfUrl(pdfUrl)
                .status("issued")
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.log("invoices", saved.getId(), "issue",
                null, Map.of("misaInvoiceNo", misaInvoiceNo, "bookingId", bookingId), null, requesterId);

        return toResponse(saved);
    }

    @Override
    public InvoiceResponse findByBooking(UUID bookingId) {
        return invoiceRepository.findByBooking_Id(bookingId)
                .map(this::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND));
    }

    @Override
    public InvoiceListResponse listInvoices(LocalDate dateFrom, LocalDate dateTo,
                                            String status, String search,
                                            int page, int limit) {

        boolean hasSearch = false;
        String searchKeyword = null;
        if (search != null && !search.trim().isEmpty()) {
            hasSearch = true;
            searchKeyword = "%" + search.trim().toLowerCase() + "%";
        }

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("issuedAt").descending());

        Page<Invoice> invoicePage = invoiceRepository.findFilteredInvoices(
                dateFrom, dateTo,
                status != null && !status.isEmpty(), status,
                hasSearch, searchKeyword,
                pageable
        );

        List<InvoiceListResponse.InvoiceSummary> pageItems = invoicePage.getContent().stream()
                .map(inv -> InvoiceListResponse.InvoiceSummary.builder()
                        .invoiceId(inv.getId())
                        .bookingId(inv.getBooking().getId())
                        .misaInvoiceNo(inv.getMisaInvoiceNo())
                        .buyerName(inv.getBooking().getUser() != null
                                ? inv.getBooking().getUser().getFullName() : "Khách vãng lai")
                        .total(inv.getBooking().getFinalAmount())
                        .status(inv.getStatus())
                        .pdfUrl(inv.getPdfUrl())
                        .issuedAt(inv.getIssuedAt())
                        .build())
                .toList();

        return InvoiceListResponse.builder()
                .invoices(pageItems)
                .pagination(InvoiceListResponse.PaginationMeta.builder()
                        .page(page)
                        .total(invoicePage.getTotalElements())
                        .totalPages(invoicePage.getTotalPages())
                        .build())
                .build();
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .bookingId(invoice.getBooking().getId())
                .misaInvoiceNo(invoice.getMisaInvoiceNo())
                .pdfUrl(invoice.getPdfUrl())
                .status(invoice.getStatus())
                .issuedAt(invoice.getIssuedAt())
                .build();
    }
}
