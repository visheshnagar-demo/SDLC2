package com.citi.cashstatement.repository;

import com.citi.cashstatement.entity.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, String> {
    List<ReportSchedule> findByStatus(String status);
    List<ReportSchedule> findByCreatedBy(String createdBy);
}
