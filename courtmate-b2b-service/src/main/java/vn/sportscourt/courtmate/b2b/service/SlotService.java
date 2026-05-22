package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.SlotMaintenanceRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotRescheduleRequest;
import vn.sportscourt.courtmate.b2b.dto.response.CalendarGridResponse;
import vn.sportscourt.courtmate.b2b.dto.response.SlotDetailResponse;
import vn.sportscourt.courtmate.b2b.dto.response.SlotResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface SlotService {
    /**
     * Admin calendar grid: all courts of a venue for a date range.
     */
    CalendarGridResponse getCalendarGrid(UUID venueId, LocalDate from, LocalDate to);

    /**
     * Reschedule an available slot to a new time.
     * Fails if the slot is already booked.
     */
    SlotResponse reschedule(UUID slotId, SlotRescheduleRequest request, UUID requesterId);

    /**
     * Mark a slot as maintenance (blocks booking).
     */
    SlotResponse setMaintenance(UUID slotId, SlotMaintenanceRequest request, UUID requesterId);

    /**
     * Restore a maintenance slot back to available.
     */
    SlotResponse restoreFromMaintenance(UUID slotId, UUID requesterId);

    SlotDetailResponse getSlotDetail(UUID slotId);
}
