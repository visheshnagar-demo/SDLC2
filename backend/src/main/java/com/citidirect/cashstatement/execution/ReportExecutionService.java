package com.citidirect.cashstatement.execution;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;
import com.citidirect.cashstatement.criteria.model.DerivedReport;
import com.citidirect.cashstatement.criteria.repository.DerivedReportRepository;
import com.citidirect.cashstatement.engine.*;
import com.citidirect.cashstatement.execution.dto.ExecutionResponse;
import com.citidirect.cashstatement.execution.dto.RunReportRequest;
import com.citidirect.cashstatement.execution.model.ReportExecution;
import com.citidirect.cashstatement.execution.repository.ReportExecutionRepository;
import com.citidirect.cashstatement.statement.StatementAggregationService;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportExecutionService {

    private final StatementAggregationService aggregationService;
    private final PdfReportEngine pdfEngine;
    private final ExcelReportEngine excelEngine;
    private final CsvReportEngine csvEngine;
    private final DhtmlReportEngine dhtmlEngine;
    private final RtfReportEngine rtfEngine;
    private final DerivedReportRepository derivedReportRepository;
    private final ReportExecutionRepository executionRepository;
    private final ObjectMapper objectMapper;

    public ReportExecutionService(StatementAggregationService aggregationService,
                                  PdfReportEngine pdfEngine,
                                  ExcelReportEngine excelEngine,
                                  CsvReportEngine csvEngine,
                                  DhtmlReportEngine dhtmlEngine,
                                  RtfReportEngine rtfEngine,
                                  DerivedReportRepository derivedReportRepository,
                                  ReportExecutionRepository executionRepository,
                                  ObjectMapper objectMapper) {
        this.aggregationService = aggregationService;
        this.pdfEngine = pdfEngine;
        this.excelEngine = excelEngine;
        this.csvEngine = csvEngine;
        this.dhtmlEngine = dhtmlEngine;
        this.rtfEngine = rtfEngine;
        this.derivedReportRepository = derivedReportRepository;
        this.executionRepository = executionRepository;
        this.objectMapper = objectMapper;
    }

    public StatementReportData getReportDataJson(RunReportRequest request, String username) {
        String reportName = request.getReportName();
        CriteriaPayload criteria = request.getCriteria();

        if (request.getDerivedReportId() != null) {
            DerivedReport dr = derivedReportRepository.findById(request.getDerivedReportId()).orElse(null);
            if (dr != null) {
                if (reportName == null) reportName = dr.getDerivedReportName();
                if (criteria == null) {
                    try {
                        criteria = objectMapper.readValue(dr.getCriteriaPayload(), CriteriaPayload.class);
                    } catch (Exception e) {
                        criteria = new CriteriaPayload();
                    }
                }
            }
        }

        if (reportName == null) reportName = "Account Statement – Comprehensive";
        if (criteria == null) criteria = new CriteriaPayload();

        return aggregationService.generateReportData(reportName, criteria, username);
    }

    public ExportResult executeReport(RunReportRequest request, String userId, String username) throws Exception {
        String reportName = request.getReportName();
        CriteriaPayload criteria = request.getCriteria();
        String format = request.getOverrideFormat();

        if (request.getDerivedReportId() != null) {
            DerivedReport dr = derivedReportRepository.findById(request.getDerivedReportId()).orElse(null);
            if (dr != null) {
                if (reportName == null) reportName = dr.getDerivedReportName();
                if (format == null) format = dr.getFormat();
                if (criteria == null) {
                    try {
                        criteria = objectMapper.readValue(dr.getCriteriaPayload(), CriteriaPayload.class);
                    } catch (Exception e) {
                        criteria = new CriteriaPayload();
                    }
                }
            }
        }

        if (reportName == null) reportName = "Account Statement – Comprehensive";
        if (criteria == null) criteria = new CriteriaPayload();
        if (format == null || "JSON".equalsIgnoreCase(format)) format = "ADOBE_PDF";

        StatementReportData reportData = aggregationService.generateReportData(reportName, criteria, username);
        ReportExportEngine engine = resolveEngine(format);

        byte[] bytes = engine.export(reportData);
        String filename = generateFilename(reportName, engine.getFileExtension());

        int totalTxns = reportData.getAccounts().stream().mapToInt(a -> a.getTransactions().size()).sum();

        // Save execution record
        ReportExecution execution = new ReportExecution();
        execution.setId(UUID.randomUUID().toString());
        execution.setDerivedReportId(request.getDerivedReportId());
        execution.setReportName(reportName);
        execution.setExecutedByUserId(userId != null ? userId : "usr-001");
        execution.setExecutionTimeGmt(OffsetDateTime.now());
        execution.setFormat(format);
        execution.setStatus("COMPLETED");
        execution.setFileName(filename);
        execution.setRecordsCount(totalTxns);
        execution.setCreatedAt(OffsetDateTime.now());

        executionRepository.save(execution);

        return new ExportResult(bytes, engine.getContentType(), filename, execution.getId());
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> getMyReports(String userId) {
        List<ReportExecution> list;
        if (userId != null) {
            list = executionRepository.findByExecutedByUserIdOrderByExecutionTimeGmtDesc(userId);
            if (list.isEmpty()) {
                list = executionRepository.findAllByOrderByExecutionTimeGmtDesc();
            }
        } else {
            list = executionRepository.findAllByOrderByExecutionTimeGmtDesc();
        }

        return list.stream().map(e -> {
            ExecutionResponse r = new ExecutionResponse();
            r.setId(e.getId());
            r.setDerivedReportId(e.getDerivedReportId());
            r.setReportName(e.getReportName());
            r.setExecutedByUserId(e.getExecutedByUserId());
            r.setExecutionTimeGmt(e.getExecutionTimeGmt());
            r.setFormat(e.getFormat());
            r.setStatus(e.getStatus());
            r.setFileName(e.getFileName());
            r.setRecordsCount(e.getRecordsCount());
            r.setDownloadUrl("/api/v1/reports/my-reports/" + e.getId() + "/download");
            return r;
        }).collect(Collectors.toList());
    }

    public ExportResult downloadReport(String executionId, String username) throws Exception {
        ReportExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution record not found: " + executionId));

        RunReportRequest req = new RunReportRequest();
        req.setDerivedReportId(execution.getDerivedReportId());
        req.setReportName(execution.getReportName());
        req.setOverrideFormat(execution.getFormat());

        return executeReport(req, execution.getExecutedByUserId(), username);
    }

    public ReportExportEngine resolveEngine(String format) {
        if (format == null) return pdfEngine;
        String f = format.toUpperCase();
        if (f.contains("EXCEL") || f.contains("XLS")) {
            return excelEngine;
        } else if (f.contains("CSV") || f.contains("COMMA")) {
            return csvEngine;
        } else if (f.contains("DHTML") || f.contains("HTML")) {
            return dhtmlEngine;
        } else if (f.contains("RTF") || f.contains("RICH TEXT")) {
            return rtfEngine;
        } else {
            return pdfEngine;
        }
    }

    private String generateFilename(String reportName, String extension) {
        String safeName = reportName.replaceAll("[^a-zA-Z0-9_\\-]", "_");
        return safeName + "." + extension;
    }

    public static class ExportResult {
        private final byte[] data;
        private final String contentType;
        private final String filename;
        private final String executionId;

        public ExportResult(byte[] data, String contentType, String filename, String executionId) {
            this.data = data;
            this.contentType = contentType;
            this.filename = filename;
            this.executionId = executionId;
        }

        public byte[] getData() {
            return data;
        }

        public String getContentType() {
            return contentType;
        }

        public String getFilename() {
            return filename;
        }

        public String getExecutionId() {
            return executionId;
        }
    }
}
