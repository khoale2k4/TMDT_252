package vn.sportscourt.courtmate.b2b.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.*;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;
import vn.sportscourt.courtmate.b2b.service.SlotBulkService;
import vn.sportscourt.courtmate.b2b.service.SlotService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * GET    /admin/venues/{venueId}/calendar                   – Calendar grid (Staff+)
 * PATCH  /admin/slots/{slotId}                              – Unified slot action (Manager+)
 * POST   /admin/courts/{courtId}/slots/bulk-generate        – Tạo slot hàng loạt (Manager+)
 * PATCH  /admin/courts/{courtId}/slots/bulk-update-price    – Cập nhật giá hàng loạt (Manager+)
 * PATCH  /admin/courts/{courtId}/slots/bulk-set-status      – Đặt trạng thái hàng loạt (Manager+)
 * GET    /admin/courts/{courtId}/slots                      – Danh sách slot của court (Staff+)
 */
@RestController
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;
    private final SlotBulkService slotBulkService;

    @GetMapping("/admin/slots/{slotId}")
    public ResponseEntity<APIResponse<SlotDetailResponse>> getSlotDetail(@PathVariable UUID slotId) {
        return ResponseEntity.ok(APIResponse.ok(slotService.getSlotDetail(slotId)));
    }

    // ── Calendar Grid ─────────────────────────────────────────────────────
    @GetMapping("/admin/venues/{venueId}/calendar")
    public ResponseEntity<APIResponse<CalendarGridResponse>> getCalendarGrid(
            @PathVariable UUID venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(APIResponse.ok(slotService.getCalendarGrid(venueId, date, date)));
    }

    // ── Unified Slot Patch ────────────────────────────────────────────────
    @PatchMapping("/admin/slots/{slotId}")
    public ResponseEntity<APIResponse<SlotPatchResponse>> patchSlot(
            @PathVariable UUID slotId,
            @Valid @RequestBody SlotPatchRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {
        return ResponseEntity.ok(APIResponse.ok(
                slotBulkService.patchSlot(slotId, request, requesterId)));
    }

    // ── Bulk Generate ─────────────────────────────────────────────────────
    @PostMapping("/admin/courts/{courtId}/slots/bulk-generate")
    public ResponseEntity<APIResponse<SlotBulkGenerateResponse>> bulkGenerate(
            @PathVariable UUID courtId,
            @Valid @RequestBody SlotBulkGenerateRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponse.ok(slotBulkService.bulkGenerate(courtId, request, requesterId)));
    }

    // ── Bulk Update Price ─────────────────────────────────────────────────
    @PatchMapping("/admin/courts/{courtId}/slots/bulk-update-price")
    public ResponseEntity<APIResponse<Object>> bulkUpdatePrice(
            @PathVariable UUID courtId,
            @Valid @RequestBody SlotBulkPriceRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {
        return ResponseEntity.ok(slotBulkService.bulkUpdatePrice(courtId, request, requesterId));
    }

    // ── Bulk Set Status ───────────────────────────────────────────────────
    @PatchMapping("/admin/courts/{courtId}/slots/bulk-set-status")
    public ResponseEntity<APIResponse<Object>> bulkSetStatus(
            @PathVariable UUID courtId,
            @Valid @RequestBody SlotBulkStatusRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {
        return ResponseEntity.ok(slotBulkService.bulkSetStatus(courtId, request, requesterId));
    }

    // ── List Court Slots ──────────────────────────────────────────────────
    @GetMapping("/admin/courts/{courtId}/slots")
    public ResponseEntity<APIResponse<CourtSlotListResponse>> listByCourtFiltered(
            @PathVariable UUID courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) SlotStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(APIResponse.ok(
                slotBulkService.listByCourtFiltered(courtId, dateFrom, dateTo, status, page, size)));
    }
}
