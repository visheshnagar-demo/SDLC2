package com.citidirect.cashstatement.criteria.repository;

import com.citidirect.cashstatement.criteria.model.DerivedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DerivedReportRepository extends JpaRepository<DerivedReport, String> {

    Optional<DerivedReport> findByDerivedReportName(String derivedReportName);

    List<DerivedReport> findByOwnerUsernameOrSharedPublicTrue(String ownerUsername);
}
