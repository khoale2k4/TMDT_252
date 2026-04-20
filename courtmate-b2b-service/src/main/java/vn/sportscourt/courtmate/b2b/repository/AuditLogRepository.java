package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.AuditLog;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(String entityName, UUID entityId);
}
