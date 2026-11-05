package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.citidirect.cashstatement.entity.GeneratedReport;
import com.citidirect.cashstatement.entity.ReportCriteria;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.repository.GeneratedReportRepository;
import com.citidirect.cashstatement.repository.ReportCriteriaRepository;
import com.citidirect.cashstatement.repository.ReportScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final GeneratedReportRepository generatedReportRepository;
    private final ReportCriteriaRepository reportCriteriaRepository;
    private final ReportScheduleRepository reportScheduleRepository;
    private final ExportEngineService exportEngineService;
    private final AuditLogService auditLogService;

    public ReportService(GeneratedReportRepository generatedReportRepository,
                         ReportCriteriaRepository reportCriteriaRepository,
                         ReportScheduleRepository reportScheduleRepository,
                         ExportEngineService exportEngineService,
                         AuditLogService auditLogService) {
        this.generatedReportRepository = generatedReportRepository;
        this.reportCriteriaRepository = reportCriteriaRepository;
        this.reportScheduleRepository = reportScheduleRepository;
        this.exportEngineService = exportEngineService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<GeneratedReport> getReports(String status, String branchCode) {
        if (status != null && (status.equalsIgnoreCase("ALL") || status.equalsIgnoreCase("Status: All"))) {
            status = null;
        }
        if (branchCode != null && branchCode.trim().isEmpty()) {
            branchCode = null;
        }
        return generatedReportRepository.findByFilters(status, branchCode);
    }

    @Transactional(readOnly = true)
    public GeneratedReport getReportById(String id) {
        return generatedReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found with ID: " + id));
    }

    @Transactional
    public GeneratedReport generateReport(ReportRequestDTO dto, String currentUserId) {
        String criteriaId = UUID.randomUUID().toString();
        ReportCriteria criteria = new ReportCriteria();
        criteria.setId(criteriaId);
        criteria.setBaseReportId(dto.getBaseReportId());
        criteria.setName(dto.getName() != null ? dto.getName() : "On-Demand Cash Statement");
        criteria.setBranchCode(dto.getBranchCode());
        criteria.setCustomerId(dto.getCustomerId());
        criteria.setAccountNumbers(dto.getAccountNumbers() != null ? dto.getAccountNumbers() : new ArrayList<>());
        criteria.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        criteria.setDatePreset(dto.getDatePreset());
        criteria.setDateFrom(dto.getDateFrom());
        criteria.setDateTo(dto.getDateTo());
        criteria.setTransactionType(dto.getTransactionType() != null ? dto.getTransactionType() : "ALL");
        criteria.setMinAmount(dto.getMinAmount());
        criteria.setMaxAmount(dto.getMaxAmount());
        criteria.setExportFormat(dto.getExportFormat() != null ? dto.getExportFormat() : "PDF");
        criteria.setCreatedBy(currentUserId != null ? currentUserId : "usr_maker_01");
        reportCriteriaRepository.save(criteria);

        String reportId = "rpt-" + UUID.randomUUID().toString().substring(0, 8);
        GeneratedReport report = new GeneratedReport();
        report.setId(reportId);
        report.setCriteriaId(criteriaId);
        report.setReportName(criteria.getName());
        report.setAccountNumbers(criteria.getAccountNumbers());
        report.setBranchCode(criteria.getBranchCode());
        report.setFrequency("On-Demand Ad-Hoc");
        report.setExportFormat(criteria.getExportFormat());
        report.setFileSizeBytes(215000L);
        report.setStatus("COMPLETED");
        report.setCreatedBy("J. Vance (Tier 4 Authorizer)");
        report.setCreatedAt(LocalDateTime.now());

        GeneratedReport saved = generatedReportRepository.save(report);

        auditLogService.log(
                currentUserId != null ? currentUserId : "usr_maker_01",
                "GENERATE_REPORT",
                "REPORT",
                saved.getId(),
                null,
                null,
                "Generated on-demand statement for accounts: " + String.join(", ", saved.getAccountNumbers())
        );

        return saved;
    }

    @Transactional
    public ReportSchedule createSchedule(ReportScheduleDTO dto, String currentUserId) {
        String scheduleId = dto.getId() != null ? dto.getId() : "sch-" + UUID.randomUUID().toString().substring(0, 8);
        ReportSchedule schedule = new ReportSchedule();
        schedule.setId(scheduleId);
        schedule.setCriteriaId(dto.getCriteriaId());
        schedule.setFrequency(dto.getFrequency() != null ? dto.getFrequency() : "DAILY");
        schedule.setCronExpression(dto.getCronExpression() != null ? dto.getCronExpression() : "0 0 17 ? * MON-FRI");
        schedule.setExecutionTimeUtc(dto.getExecutionTimeUtc() != null ? dto.getExecutionTimeUtc() : "17:00:00");
        schedule.setExportFormat(dto.getExportFormat() != null ? dto.getExportFormat() : "PDF");
        schedule.setStatus("PENDING_APPROVAL");
        schedule.setCreatedBy(currentUserId != null ? currentUserId : "usr_maker_01");
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());

        ReportSchedule saved = reportScheduleRepository.save(schedule);

        auditLogService.log(
                schedule.getCreatedBy(),
                "CREATE_SCHEDULE",
                "SCHEDULE",
                saved.getId(),
                null,
                null,
                "Created report schedule: " + saved.getFrequency() + " (" + saved.getExportFormat() + ")"
        );

        return saved;
    }

    public byte[] exportReport(String reportId, String format, String currentUserId) {
        GeneratedReport report = getReportById(reportId);
        String targetFormat = format != null ? format.toUpperCase() : (report.getExportFormat() != null ? report.getExportFormat().toUpperCase() : "PDF");

        byte[] exportBytes;
        if ("EXCEL".equals(targetFormat) || "XLSX".equals(targetFormat)) {
            exportBytes = exportEngineService.generateExcelExport(report);
        } else if ("CSV".equals(targetFormat)) {
            exportBytes = exportEngineService.generateCsvExport(report);
        } else {
            exportBytes = exportEngineService.generatePdfExport(report);
        }

        auditLogService.log(
                currentUserId != null ? currentUserId : "anonymous",
                "EXPORT_REPORT",
                "REPORT",
                report.getId(),
                null,
                null,
                "Exported report in format: " + targetFormat
        );

        return exportBytes;
    }
}
