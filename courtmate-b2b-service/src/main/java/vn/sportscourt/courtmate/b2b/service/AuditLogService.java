package vn.sportscourt.courtmate.b2b.service;

import java.util.UUID;

public interface AuditLogService {
    void log(String entityName, UUID entityId, String action,
             Object oldValue, Object newValue, String reason, UUID performedBy);
}
