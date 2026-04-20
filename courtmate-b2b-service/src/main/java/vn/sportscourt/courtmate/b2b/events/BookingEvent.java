package vn.sportscourt.courtmate.b2b.events;

/**
 * Events that drive the Booking state machine.
 * pending_payment ──PAY──► confirmed ──CHECK_IN──► completed
 *                       └──CANCEL──► cancelled
 * confirmed ──CANCEL──► cancelled
 * confirmed ──REFUND──► cancelled  (with refund flag)
 */
public enum BookingEvent {
    PAY,
    CANCEL,
    REFUND,
    CHECK_IN,
    WALK_IN     // staff creates walk-in booking; goes directly to confirmed
}
