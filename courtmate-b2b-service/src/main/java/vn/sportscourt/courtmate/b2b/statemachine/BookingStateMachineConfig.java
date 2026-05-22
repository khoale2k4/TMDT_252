package vn.sportscourt.courtmate.b2b.statemachine;

import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.StateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.events.BookingEvent;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class BookingStateMachineConfig
    extends StateMachineConfigurerAdapter<BookingStatus, BookingEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<BookingStatus, BookingEvent> states) throws Exception {
        states.withStates()
                .initial(BookingStatus.pending_payment)
                .states(EnumSet.allOf(BookingStatus.class))
                .end(BookingStatus.completed)
                .end(BookingStatus.cancelled);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<BookingStatus, BookingEvent> transitions) throws Exception {
        transitions
        // Customer pays -> booking confirmed
        .withExternal()
                .source(BookingStatus.pending_payment).target(BookingStatus.confirmed)
                .event(BookingEvent.PAY)
        .and()

        // Staff walk-in -> instantly confirmed (skips payment step)
        .withExternal()
                .source(BookingStatus.pending_payment).target(BookingStatus.confirmed)
                .event(BookingEvent.WALK_IN)
        .and()

        // Cancel before payment
        .withExternal()
                .source(BookingStatus.pending_payment).target(BookingStatus.cancelled)
                .event(BookingEvent.CANCEL)
        .and()

        // Cancel confirmed booking (no refund)
        .withExternal()
                .source(BookingStatus.confirmed).target(BookingStatus.cancelled)
                .event(BookingEvent.CANCEL)
        .and()

        // Cancel + refund a confirmed booking
        .withExternal()
                .source(BookingStatus.confirmed).target(BookingStatus.cancelled)
                .event(BookingEvent.REFUND)
        .and()

        // Staff checks in customer -> booking completed
        .withExternal()
                .source(BookingStatus.confirmed).target(BookingStatus.completed)
                .event(BookingEvent.CHECK_IN);
    }
}
