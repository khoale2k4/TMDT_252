package vn.sportscourt.courtmate.b2b.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.response.APIResponse;
import vn.sportscourt.courtmate.b2b.dto.response.InvoiceListResponse;
import vn.sportscourt.courtmate.b2b.dto.response.InvoiceResponse;
import vn.sportscourt.courtmate.b2b.service.InvoiceService;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/admin/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<APIResponse<InvoiceListResponse>> listInvoices(
            @RequestParam(value = "date_from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(value = "date_to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateTo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        return ResponseEntity.ok(APIResponse.ok(
                invoiceService.listInvoices(dateFrom, dateTo, status, search, page, limit)
        ));
    }
}
