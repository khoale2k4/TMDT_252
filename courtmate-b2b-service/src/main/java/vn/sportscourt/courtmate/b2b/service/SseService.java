package vn.sportscourt.courtmate.b2b.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.UUID;

public interface SseService {
    SseEmitter createEmitter(UUID venueId);
    void sendEventToVenue(UUID venueId, String eventName, Object data);
}
