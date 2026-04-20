package vn.sportscourt.courtmate.b2b.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.entity.AuditLog;
import vn.sportscourt.courtmate.b2b.entity.User;
import vn.sportscourt.courtmate.b2b.repository.AuditLogRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;

import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Async + new transaction so audit logs never block or rollback the main flow.
     */
    @Async
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityName, UUID entityId, String action,
                    Object oldValue, Object newValue, String reason, UUID performedBy) {
        try {
            AuditLog entry = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .oldValue(toMap(oldValue))
                    .newValue(toMap(newValue))
                    .reason(reason)
                    .performedBy(performedBy != null ? User.builder().id(performedBy).build() : null)
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            // Never let audit failure break the main transaction
            log.error("Failed to write audit log: entity={} id={} action={}", entityName, entityId, action, e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object value) {
        if (value == null) return null;
        if (value instanceof Map) return (Map<String, Object>) value;
        return objectMapper.convertValue(value, Map.class);
    }
}
