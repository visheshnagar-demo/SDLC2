package com.citidirect.cashstatement.audit.repository;

import com.citidirect.cashstatement.audit.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrail, String> {

    List<AuditTrail> findAllByOrderByTimestampGmtDesc();

    List<AuditTrail> findByUsernameOrderByTimestampGmtDesc(String username);
}
