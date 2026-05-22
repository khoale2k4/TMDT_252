package vn.sportscourt.courtmate.b2b.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Staff creates a walk-in booking directly at the venue.
 * Booking goes straight to CONFIRMED and payment is cash.
 */
@Data
public class WalkInBookingRequest {
    /** Customer user id — optional, staff may create without account */
    private UUID userId;

    @NotNull(message = "Venue không được để trống")
    private UUID venueId;

    @NotEmpty(message = "Cần ít nhất 1 slot")
    private List<UUID> slotIds;

    private String notes;
}
