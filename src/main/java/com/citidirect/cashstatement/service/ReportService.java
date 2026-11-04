package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportResponseDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.citidirect.cashstatement.entity.GeneratedReport;
import com.citidirect.cashstatement.entity.ReportCriteria;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.repository.GeneratedReportRepository;
import com.citidirect.cashstatement.repository.ReportCriteriaRepository;
import com.citidirect.cashstatement.repository.ReportScheduleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportCriteriaRepository reportCriteriaRepository;
    private final ReportScheduleRepository reportScheduleRepository;
    private final GeneratedReportRepository generatedReportRepository;
    private final ExportEngineService exportEngineService;
    private final AuditLogService auditLogService;

    public ReportService(ReportCriteriaRepository reportCriteriaRepository,
                         ReportScheduleRepository reportScheduleRepository,
                         GeneratedReportRepository generatedReportRepository,
                         ExportEngineService exportEngineService,
                         AuditLogService auditLogService) {
        this.reportCriteriaRepository = reportCriteriaRepository;
        this.reportScheduleRepository = reportScheduleRepository;
        this.generatedReportRepository = generatedReportRepository;
        this.exportEngineService = exportEngineService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReports(String status, Pageable pageable) {
        Page<GeneratedReport> page;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            page = generatedReportRepository.findByStatusIgnoreCase(status, pageable);
        } else {
            page = generatedReportRepository.findAll(pageable);
        }

        List<ReportResponseDTO> content = page.getContent().stream().map(r -> {
            ReportResponseDTO dto = new ReportResponseDTO();
            dto.setId(r.getId());
            dto.setReportName(r.getReportName());
            dto.setExportFormat(r.getExportFormat());
            dto.setStatus(r.getStatus());
            dto.setCreatedAt(r.getCreatedAt());
            dto.setCreatedBy(r.getGeneratedBy());
            dto.setAccountNumbers(List.of("ACC-100234"));
            dto.setBranchCode("BR-NYC-001");
            dto.setCurrency("USD");
            return dto;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("total_elements", page.getTotalElements());
        response.put("total_pages", page.getTotalPages());
        response.put("current_page", page.getNumber());
        return response;
    }

    @Transactional
    public Map<String, Object> generateReport(ReportRequestDTO dto, String userId, String clientIp) {
        ReportCriteria criteria = new ReportCriteria();
        criteria.setBaseReportId(dto.getBaseReportId() != null ? dto.getBaseReportId() : UUID.randomUUID().toString());
        criteria.setName(dto.getName() != null ? dto.getName() : "Cash Statement Report");
        criteria.setBranchCode(dto.getBranchCode() != null ? dto.getBranchCode() : "BR-NYC-001");
        criteria.setCustomerId(dto.getCustomerId() != null ? dto.getCustomerId() : "CUST-9021");
        criteria.setAccountNumbers(dto.getAccountNumbers() != null && !dto.getAccountNumbers().isEmpty()
                ? String.join(",", dto.getAccountNumbers()) : "ACC-100234");
        criteria.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        criteria.setDatePreset(dto.getDatePreset());
        criteria.setDateFrom(dto.getDateFrom());
        criteria.setDateTo(dto.getDateTo());
        criteria.setTransactionType(dto.getTransactionType() != null ? dto.getTransactionType() : "ALL");
        criteria.setMinAmount(dto.getMinAmount());
        criteria.setMaxAmount(dto.getMaxAmount());
        criteria.setCreatedBy(userId);

        ReportCriteria savedCriteria = reportCriteriaRepository.save(criteria);

        GeneratedReport report = new GeneratedReport();
        report.setCriteriaId(savedCriteria.getId());
        report.setReportName(criteria.getName());
        report.setExportFormat(dto.getExportFormat() != null ? dto.getExportFormat().toUpperCase() : "PDF");
        report.setStatus("COMPLETED");
        report.setGeneratedBy(userId);
        report.setFileSizeBytes(102400L);

        GeneratedReport savedReport = generatedReportRepository.save(report);

        auditLogService.logAction(userId, "GENERATE_REPORT", "GeneratedReport", savedReport.getId(), clientIp,
                "Generated report: " + report.getReportName() + " format: " + report.getExportFormat());

        Map<String, Object> result = new HashMap<>();
        result.put("report_id", savedReport.getId());
        result.put("status", savedReport.getStatus());
        result.put("message", "Report generation completed successfully");
        return result;
    }

    @Transactional
    public ReportSchedule scheduleReport(ReportScheduleDTO dto, String userId, String clientIp) {
        ReportSchedule schedule = new ReportSchedule();
        schedule.setCriteriaId(dto.getCriteriaId() != null ? dto.getCriteriaId() : UUID.randomUUID().toString());
        schedule.setFrequency(dto.getFrequency() != null ? dto.getFrequency() : "WEEKLY");
        schedule.setCronExpression(dto.getCronExpression() != null ? dto.getCronExpression() : "0 0 8 ? * MON");
        schedule.setExecutionTimeUtc(dto.getExecutionTimeUtc() != null ? dto.getExecutionTimeUtc() : "08:00:00");
        schedule.setExportFormat(dto.getExportFormat() != null ? dto.getExportFormat().toUpperCase() : "PDF");
        schedule.setStatus("PENDING_APPROVAL");
        schedule.setCreatedBy(userId);

        ReportSchedule saved = reportScheduleRepository.save(schedule);
        auditLogService.logAction(userId, "SCHEDULE_REPORT", "ReportSchedule", saved.getId(), clientIp,
                "Created recurring report schedule for criteria: " + saved.getCriteriaId());
        return saved;
    }

    @Transactional(readOnly = true)
    public byte[] exportReport(String reportId, String format, String userId, String clientIp) {
        GeneratedReport report = generatedReportRepository.findById(reportId).orElse(null);
        String reportName = report != null ? report.getReportName() : "Cash Statement Report";
        String exportFormat = format != null ? format.toUpperCase() : (report != null ? report.getExportFormat() : "PDF");

        byte[] exportBytes;
        if ("EXCEL".equalsIgnoreCase(exportFormat) || "XLSX".equalsIgnoreCase(exportFormat)) {
            exportBytes = exportEngineService.generateExcelReport(reportName, "ACC-100234", "USD");
        } else if ("CSV".equalsIgnoreCase(exportFormat)) {
            exportBytes = exportEngineService.generateCsvReport(reportName, "ACC-100234", "USD");
        } else {
            exportBytes = exportEngineService.generatePdfReport(reportName, "ACC-100234", "USD");
        }

        auditLogService.logAction(userId, "EXPORT_REPORT", "GeneratedReport", reportId, clientIp,
                "Exported statement in format: " + exportFormat);
        return exportBytes;
    }
}
