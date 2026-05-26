package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.sportscourt.courtmate.b2b.service.SseService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseServiceImpl implements SseService {

    // Store emitters per venueId. One venue can have multiple active clients (e.g. multiple tabs or devices)
    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Override
    public SseEmitter createEmitter(UUID venueId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hour timeout
        
        emitters.computeIfAbsent(venueId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(venueId, emitter));
        emitter.onTimeout(() -> removeEmitter(venueId, emitter));
        emitter.onError((e) -> removeEmitter(venueId, emitter));

        try {
            // Send initial ping to establish connection
            emitter.send(SseEmitter.event().name("INIT").data("Connected"));
        } catch (IOException e) {
            removeEmitter(venueId, emitter);
        }

        return emitter;
    }

    @Override
    public void sendEventToVenue(UUID venueId, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> venueEmitters = emitters.get(venueId);
        if (venueEmitters != null) {
            for (SseEmitter emitter : venueEmitters) {
                try {
                    emitter.send(SseEmitter.event().name(eventName).data(data));
                } catch (IOException e) {
                    removeEmitter(venueId, emitter);
                }
            }
        }
    }

    private void removeEmitter(UUID venueId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> venueEmitters = emitters.get(venueId);
        if (venueEmitters != null) {
            venueEmitters.remove(emitter);
            if (venueEmitters.isEmpty()) {
                emitters.remove(venueId);
            }
        }
    }
}
