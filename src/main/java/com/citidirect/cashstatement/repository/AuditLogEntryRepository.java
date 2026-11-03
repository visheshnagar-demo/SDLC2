package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.AuditLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogEntryRepository extends JpaRepository<AuditLogEntry, String> {
    List<AuditLogEntry> findByActorId(String actorId);
    List<AuditLogEntry> findByEntityId(String entityId);
}
