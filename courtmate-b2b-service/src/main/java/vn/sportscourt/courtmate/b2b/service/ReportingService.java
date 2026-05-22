package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.response.RevenueReportResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface ReportingService {
    RevenueReportResponse revenueReport(UUID venueId, LocalDate from, LocalDate to);
}

