package vn.sportscourt.courtmate.b2b.statemachine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.StateMachineEventResult;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.events.BookingEvent;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingStateMachineService {
    private final StateMachineFactory<BookingStatus, BookingEvent> factory;

    /**
     * Rebuild the state machine from the booking's current persisted status,
     * then send the given event. Throws AppException if the transition is invalid.
     *
     * @param bookingId     used only for logging/tracing
     * @param currentStatus the status loaded from DB
     * @param event         the event to fire
     * @return              the new BookingStatus after transition
     */
    public BookingStatus transition(UUID bookingId, BookingStatus currentStatus, BookingEvent event) {
        StateMachine<BookingStatus, BookingEvent> sm = buildAndRestore(bookingId, currentStatus);
        sm.startReactively().block();

        Message<BookingEvent> message = MessageBuilder.withPayload(event).build();

        StateMachineEventResult<BookingStatus, BookingEvent> result = sm
                .sendEvent(Mono.just(message))
                .blockFirst();

        boolean accepted = result != null && result.getResultType() == StateMachineEventResult.ResultType.ACCEPTED;

        if (!accepted) {
            log.warn("Invalid transition: booking={} status={} event={}", bookingId, currentStatus, event);
            throw new AppException(ErrorCode.BOOKING_INVALID_TRANSITION,
                    java.util.Map.of(
                            "currentStatus", currentStatus.name(),
                            "event", event.name()
                    )
            );
        }

        BookingStatus newStatus = sm.getState().getId();
        log.info("Booking {} transitioned: {} --[{}]--> {}", bookingId, currentStatus, event, newStatus);
        sm.stopReactively().block();
        return newStatus;
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private StateMachine<BookingStatus, BookingEvent> buildAndRestore(UUID bookingId, BookingStatus status) {
        StateMachine<BookingStatus, BookingEvent> sm = factory.getStateMachine(bookingId.toString());
        sm.stopReactively().block();

        // Rehydrate state from DB — do NOT call start() yet
        sm.getStateMachineAccessor()
                .doWithAllRegions(accessor ->
                        accessor.resetStateMachineReactively(
                                new DefaultStateMachineContext<>(status, null, null, null)
                        ).block()
                );
        return sm;
    }
}
