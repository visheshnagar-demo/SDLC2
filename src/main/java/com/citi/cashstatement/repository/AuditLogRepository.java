package com.citi.cashstatement.repository;

import com.citi.cashstatement.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByUserId(String userId);
    List<AuditLog> findByTargetResource(String targetResource);
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
