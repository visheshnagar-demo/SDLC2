package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.ReportResponse;
import com.citidirect.cashstatement.dto.ReportSearchRequest;
import com.citidirect.cashstatement.entity.ReportCriteria;
import com.citidirect.cashstatement.entity.StatementLineItem;
import com.citidirect.cashstatement.entity.StatementReport;
import com.citidirect.cashstatement.repository.ReportCriteriaRepository;
import com.citidirect.cashstatement.repository.StatementLineItemRepository;
import com.citidirect.cashstatement.repository.StatementReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final StatementReportRepository reportRepository;
    private final StatementLineItemRepository lineItemRepository;
    private final ReportCriteriaRepository criteriaRepository;
    private final ExportService exportService;
    private final AuditLogService auditLogService;

    public ReportService(StatementReportRepository reportRepository,
                         StatementLineItemRepository lineItemRepository,
                         ReportCriteriaRepository criteriaRepository,
                         ExportService exportService,
                         AuditLogService auditLogService) {
        this.reportRepository = reportRepository;
        this.lineItemRepository = lineItemRepository;
        this.criteriaRepository = criteriaRepository;
        this.exportService = exportService;
        this.auditLogService = auditLogService;
    }

    public List<ReportResponse> searchReports(ReportSearchRequest request) {
        List<StatementReport> reports;
        if (request == null) {
            reports = reportRepository.findAll();
        } else {
            reports = reportRepository.findAll().stream()
                .filter(r -> request.getAccountNumber() == null || request.getAccountNumber().isEmpty() || r.getAccountNumber().equalsIgnoreCase(request.getAccountNumber()))
                .filter(r -> request.getBranchCode() == null || request.getBranchCode().isEmpty() || r.getBranchCode().equalsIgnoreCase(request.getBranchCode()))
                .filter(r -> request.getCustomerId() == null || request.getCustomerId().isEmpty() || r.getCustomerId().equalsIgnoreCase(request.getCustomerId()))
                .filter(r -> request.getStatus() == null || request.getStatus().isEmpty() || r.getGenerationStatus().equalsIgnoreCase(request.getStatus()))
                .filter(r -> request.getCurrency() == null || request.getCurrency().isEmpty() || r.getCurrency().equalsIgnoreCase(request.getCurrency()))
                .collect(Collectors.toList());
        }

        return reports.stream().map(r -> {
            List<StatementLineItem> items = lineItemRepository.findByReportId(r.getId());
            return new ReportResponse(r, items);
        }).collect(Collectors.toList());
    }

    public ReportResponse getReportById(String id) {
        StatementReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found with ID: " + id));
        List<StatementLineItem> items = lineItemRepository.findByReportId(report.getId());
        return new ReportResponse(report, items);
    }

    @Transactional
    public ReportResponse generateReport(String criteriaIdOrReportId, String actorId) {
        // If criteria exists or report ID given, generate on-demand report
        ReportCriteria criteria = criteriaRepository.findById(criteriaIdOrReportId).orElse(null);

        StatementReport report = new StatementReport();
        report.setId("REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        report.setCriteriaId(criteria != null ? criteria.getId() : criteriaIdOrReportId);
        report.setReportName(criteria != null && criteria.getReportName() != null ? criteria.getReportName() : "Account Statement - Comprehensive");
        report.setReportType("CASH_STATEMENT");
        report.setBranchCode(criteria != null && criteria.getBranchCode() != null ? criteria.getBranchCode() : "SG001");
        report.setCustomerId(criteria != null && criteria.getCustomerId() != null ? criteria.getCustomerId() : "CUST-99201");
        report.setAccountNumber(criteria != null && criteria.getAccountNumber() != null ? criteria.getAccountNumber() : "8829102931");
        report.setCurrency(criteria != null && criteria.getCurrency() != null ? criteria.getCurrency() : "USD");
        report.setGenerationStatus("COMPLETED");
        report.setStatementDate(LocalDate.now().toString());
        report.setOpeningBalance(new BigDecimal("1000000.00"));
        report.setTotalDebits(new BigDecimal("150000.00"));
        report.setTotalCredits(new BigDecimal("250000.00"));
        report.setClosingBalance(new BigDecimal("1100000.00"));
        report.setGeneratedAt(Instant.now());

        StatementReport savedReport = reportRepository.save(report);

        // Seed 3 line items for new report
        List<StatementLineItem> items = new ArrayList<>();
        StatementLineItem item1 = new StatementLineItem();
        item1.setReportId(savedReport.getId());
        item1.setTxnDate(LocalDate.now().toString());
        item1.setValueDate(LocalDate.now().toString());
        item1.setTxnReference("TXN-" + System.currentTimeMillis() + "-01");
        item1.setDescription("Generated Statement - Intercompany Outward Wire");
        item1.setDebitAmount(new BigDecimal("150000.00"));
        item1.setCreditAmount(BigDecimal.ZERO);
        item1.setBalanceAfter(new BigDecimal("850000.00"));
        items.add(lineItemRepository.save(item1));

        StatementLineItem item2 = new StatementLineItem();
        item2.setReportId(savedReport.getId());
        item2.setTxnDate(LocalDate.now().toString());
        item2.setValueDate(LocalDate.now().toString());
        item2.setTxnReference("TXN-" + System.currentTimeMillis() + "-02");
        item2.setDescription("Generated Statement - Inward Clearing Deposit");
        item2.setDebitAmount(BigDecimal.ZERO);
        item2.setCreditAmount(new BigDecimal("250000.00"));
        item2.setBalanceAfter(new BigDecimal("1100000.00"));
        items.add(lineItemRepository.save(item2));

        // Audit log
        auditLogService.logAction(
            actorId != null ? actorId : "user-maker-01",
            "Maker User",
            "ROLE_MAKER",
            "GENERATE",
            "StatementReport",
            savedReport.getId(),
            "127.0.0.1",
            "Generated on-demand cash statement report for account " + savedReport.getAccountNumber()
        );

        return new ReportResponse(savedReport, items);
    }

    public byte[] exportReport(String reportId, String format, String actorId) {
        StatementReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found with ID: " + reportId));
        List<StatementLineItem> items = lineItemRepository.findByReportId(report.getId());

        auditLogService.logAction(
            actorId != null ? actorId : "user-maker-01",
            "Corporate User",
            "ROLE_MAKER",
            "EXPORT",
            "StatementReport",
            report.getId(),
            "127.0.0.1",
            "Exported report " + report.getId() + " in format " + format
        );

        if ("PDF".equalsIgnoreCase(format)) {
            return exportService.generatePdfExport(report, items);
        } else if ("EXCEL".equalsIgnoreCase(format) || "XLSX".equalsIgnoreCase(format)) {
            return exportService.generateExcelExport(report, items);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return exportService.generateCsvExport(report, items).getBytes();
        } else {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Unsupported export format: " + format);
        }
    }
}
