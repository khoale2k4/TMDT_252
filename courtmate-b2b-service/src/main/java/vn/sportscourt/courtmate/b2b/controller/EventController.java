package vn.sportscourt.courtmate.b2b.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.sportscourt.courtmate.b2b.service.SseService;

import java.util.UUID;

@RestController
@RequestMapping("/admin/events")
@RequiredArgsConstructor
public class EventController {

    private final SseService sseService;

    @GetMapping(value = "/bookings", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @RequestParam UUID venueId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        
        // In a real scenario, we should verify if the user has access to this venueId.
        // For now, we return the emitter for the specified venue.
        return sseService.createEmitter(venueId);
    }
}
