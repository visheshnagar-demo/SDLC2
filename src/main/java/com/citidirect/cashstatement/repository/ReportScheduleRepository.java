package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, String> {
    List<ReportSchedule> findByStatus(String status);
    List<ReportSchedule> findByCriteriaId(String criteriaId);
}
