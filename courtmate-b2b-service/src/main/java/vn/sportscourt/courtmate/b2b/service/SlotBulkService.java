package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkGenerateRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkPriceRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkStatusRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotPatchRequest;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SlotBulkService {

    /** POST /admin/courts/{courtId}/slots/bulk-generate */
    SlotBulkGenerateResponse bulkGenerate(UUID courtId, SlotBulkGenerateRequest request, UUID requesterId);

    /** PATCH /admin/courts/{courtId}/slots/bulk-update-price */
    APIResponse<Object> bulkUpdatePrice(UUID courtId, SlotBulkPriceRequest request, UUID requesterId);

    /** PATCH /admin/courts/{courtId}/slots/bulk-set-status */
    APIResponse<Object> bulkSetStatus(UUID courtId, SlotBulkStatusRequest request, UUID requesterId);

    /** GET /admin/courts/{courtId}/slots */
    CourtSlotListResponse listByCourtFiltered(UUID courtId, LocalDate dateFrom, LocalDate dateTo, SlotStatus status, int page, int size);

    /** PATCH /admin/slots/{slotId} — unified action: reschedule | set_maintenance | restore */
    SlotPatchResponse patchSlot(UUID slotId, SlotPatchRequest request, UUID requesterId);
}
