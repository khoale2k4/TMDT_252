package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.response.InvoiceListResponse;
import vn.sportscourt.courtmate.b2b.dto.response.InvoiceResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse issue(UUID bookingId, UUID requesterId);

    InvoiceResponse findByBooking(UUID bookingId);

    InvoiceListResponse listInvoices(LocalDate dateFrom, LocalDate dateTo,
                                     String status, String search,
                                     int page, int limit);
}
