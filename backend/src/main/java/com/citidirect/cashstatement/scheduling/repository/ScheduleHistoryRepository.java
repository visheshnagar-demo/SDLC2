package com.citidirect.cashstatement.scheduling.repository;

import com.citidirect.cashstatement.scheduling.model.ScheduleHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleHistoryRepository extends JpaRepository<ScheduleHistory, String> {

    List<ScheduleHistory> findByScheduleIdOrderByExecutionTimeGmtDesc(String scheduleId);
}
