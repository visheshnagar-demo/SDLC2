package com.citidirect.cashstatement.execution.repository;

import com.citidirect.cashstatement.execution.model.ReportExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportExecutionRepository extends JpaRepository<ReportExecution, String> {

    List<ReportExecution> findByExecutedByUserIdOrderByExecutionTimeGmtDesc(String executedByUserId);

    List<ReportExecution> findAllByOrderByExecutionTimeGmtDesc();
}
