package com.identiverify.repository;

import com.identiverify.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByEntityNameOrderByCreatedAtDesc(String entityName);
    List<AuditLog> findByActorIdOrderByCreatedAtDesc(UUID actorId);
    Optional<AuditLog> findTopByOrderByCreatedAtDesc();
}
