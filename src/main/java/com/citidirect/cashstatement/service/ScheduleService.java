package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.ScheduleRequest;
import com.citidirect.cashstatement.dto.ScheduleResponse;
import com.citidirect.cashstatement.entity.ReportCriteria;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.repository.ReportCriteriaRepository;
import com.citidirect.cashstatement.repository.ReportScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ReportScheduleRepository scheduleRepository;
    private final ReportCriteriaRepository criteriaRepository;
    private final AuditLogService auditLogService;

    public ScheduleService(ReportScheduleRepository scheduleRepository,
                           ReportCriteriaRepository criteriaRepository,
                           AuditLogService auditLogService) {
        this.scheduleRepository = scheduleRepository;
        this.criteriaRepository = criteriaRepository;
        this.auditLogService = auditLogService;
    }

    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request, String makerId) {
        if (request == null || request.getScheduleName() == null || request.getFrequency() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "schedule_name and frequency are mandatory.");
        }

        String criteriaId = null;
        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            ReportCriteria crit = new ReportCriteria();
            crit.setCreatedBy(makerId != null ? makerId : "user-maker-01");
            crit.setReportTemplateId(request.getReportTemplateId());
            Map<String, Object> cMap = request.getCriteria();
            if (cMap.get("customer_id") != null) crit.setCustomerId(cMap.get("customer_id").toString());
            if (cMap.get("currency") != null) crit.setCurrency(cMap.get("currency").toString());
            if (cMap.get("branch_codes") != null) crit.setBranchCode(cMap.get("branch_codes").toString());
            if (cMap.get("account_numbers") != null) crit.setAccountNumber(cMap.get("account_numbers").toString());
            ReportCriteria savedCrit = criteriaRepository.save(crit);
            criteriaId = savedCrit.getId();
        }

        ReportSchedule schedule = new ReportSchedule();
        schedule.setScheduleName(request.getScheduleName());
        schedule.setFrequency(request.getFrequency());
        schedule.setCronExpression(request.getCronExpression() != null ? request.getCronExpression() : "0 0 8 * * ?");
        schedule.setStartDate(request.getStartDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setIntradayHours(request.getIntradayHours() != null ? request.getIntradayHours() : 0);
        schedule.setIntradayMinutes(request.getIntradayMinutes() != null ? request.getIntradayMinutes() : 0);
        schedule.setIntradaySeconds(request.getIntradaySeconds() != null ? request.getIntradaySeconds() : 0);
        schedule.setTriggerEvent(request.getTriggerEvent());
        schedule.setNotifyEmails(request.getNotifyEmails());
        schedule.setDeliveryOptionId(request.getDeliveryOptionId());
        schedule.setCriteriaId(criteriaId);
        schedule.setStatus("PENDING_AUTHORIZATION");
        schedule.setMakerId(makerId != null ? makerId : "user-maker-01");
        schedule.setCreatedAt(Instant.now());
        schedule.setUpdatedAt(Instant.now());

        ReportSchedule saved = scheduleRepository.save(schedule);

        auditLogService.logAction(
            schedule.getMakerId(),
            "Maker User",
            "ROLE_MAKER",
            "CREATE",
            "ReportSchedule",
            saved.getId(),
            "127.0.0.1",
            "Created recurring report schedule: " + saved.getScheduleName()
        );

        return new ScheduleResponse(saved);
    }
}
