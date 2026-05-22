package vn.sportscourt.courtmate.b2b.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.sportscourt.courtmate.b2b.dto.response.APIResponse;
import vn.sportscourt.courtmate.b2b.dto.response.RevenueReportResponse;
import vn.sportscourt.courtmate.b2b.service.ReportingService;

import java.time.LocalDate;
import java.util.UUID;

/**
 * GET admin/reports/revenue?venueId=&from=&to=   – Báo cáo doanh thu
 */
@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/revenue")
    public ResponseEntity<APIResponse<RevenueReportResponse>> revenue(
            @RequestParam UUID venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(APIResponse.ok(reportingService.revenueReport(venueId, from, to)));
    }
}
