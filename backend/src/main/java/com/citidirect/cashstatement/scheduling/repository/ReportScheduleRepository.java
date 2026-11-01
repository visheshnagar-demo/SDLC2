package com.citidirect.cashstatement.scheduling.repository;

import com.citidirect.cashstatement.scheduling.model.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, String> {

    Optional<ReportSchedule> findByScheduleName(String scheduleName);

    Optional<ReportSchedule> findByScheduleReferenceId(String scheduleReferenceId);

    List<ReportSchedule> findByAuthStatus(String authStatus);

    long countByAuthStatus(String authStatus);
}
