package com.citidirect.cashstatement.scheduling;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;
import com.citidirect.cashstatement.criteria.model.DerivedReport;
import com.citidirect.cashstatement.criteria.repository.DerivedReportRepository;
import com.citidirect.cashstatement.delivery.MailNotificationService;
import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.engine.*;
import com.citidirect.cashstatement.scheduling.model.ReportSchedule;
import com.citidirect.cashstatement.scheduling.model.ScheduleHistory;
import com.citidirect.cashstatement.scheduling.repository.ReportScheduleRepository;
import com.citidirect.cashstatement.scheduling.repository.ScheduleHistoryRepository;
import com.citidirect.cashstatement.statement.StatementAggregationService;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class QuartzReportJob implements Job {

    private final StatementAggregationService aggregationService;
    private final PdfReportEngine pdfEngine;
    private final ExcelReportEngine excelEngine;
    private final CsvReportEngine csvEngine;
    private final DhtmlReportEngine dhtmlEngine;
    private final RtfReportEngine rtfEngine;
    private final MailNotificationService mailService;
    private final ReportScheduleRepository scheduleRepository;
    private final ScheduleHistoryRepository historyRepository;
    private final DerivedReportRepository derivedReportRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ObjectMapper objectMapper;

    public QuartzReportJob(StatementAggregationService aggregationService,
                           PdfReportEngine pdfEngine,
                           ExcelReportEngine excelEngine,
                           CsvReportEngine csvEngine,
                           DhtmlReportEngine dhtmlEngine,
                           RtfReportEngine rtfEngine,
                           MailNotificationService mailService,
                           ReportScheduleRepository scheduleRepository,
                           ScheduleHistoryRepository historyRepository,
                           DerivedReportRepository derivedReportRepository,
                           DeliveryOptionRepository deliveryOptionRepository,
                           ObjectMapper objectMapper) {
        this.aggregationService = aggregationService;
        this.pdfEngine = pdfEngine;
        this.excelEngine = excelEngine;
        this.csvEngine = csvEngine;
        this.dhtmlEngine = dhtmlEngine;
        this.rtfEngine = rtfEngine;
        this.mailService = mailService;
        this.scheduleRepository = scheduleRepository;
        this.historyRepository = historyRepository;
        this.derivedReportRepository = derivedReportRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        String scheduleId = context.getMergedJobDataMap().getString("scheduleId");
        if (scheduleId == null) {
            return;
        }
        executeSchedule(scheduleId);
    }

    public void executeSchedule(String scheduleId) {
        ReportSchedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
        if (schedule == null || !"AUTHORIZED".equalsIgnoreCase(schedule.getAuthStatus())) {
            return;
        }

        DerivedReport derivedReport = derivedReportRepository.findById(schedule.getDerivedReportId()).orElse(null);
        DeliveryOption deliveryOption = deliveryOptionRepository.findById(schedule.getDeliveryOptionId()).orElse(null);

        String status = "SUCCESS";
        int recordsCount = 0;
        String errorMsg = null;
        String recipients = deliveryOption != null ? deliveryOption.getEmailRecipients() : "";

        try {
            CriteriaPayload savedCriteria = new CriteriaPayload();
            String format = "ADOBE_PDF";

            if (derivedReport != null) {
                if (derivedReport.getFormat() != null) {
                    format = derivedReport.getFormat();
                }
                if (derivedReport.getCriteriaPayload() != null) {
                    try {
                        savedCriteria = objectMapper.readValue(derivedReport.getCriteriaPayload(), CriteriaPayload.class);
                    } catch (Exception ignored) {
                        savedCriteria = new CriteriaPayload();
                    }
                }
            }

            StatementReportData reportData = aggregationService.generateReportData(
                    schedule.getEventName(),
                    savedCriteria,
                    schedule.getRunTimeUser() != null ? schedule.getRunTimeUser() : "SYSTEM"
            );

            recordsCount = reportData.getAccounts().stream()
                    .mapToInt(a -> a.getTransactions().size())
                    .sum();

            ReportExportEngine engine = resolveEngine(format);
            byte[] reportBytes = engine.export(reportData);

            if (deliveryOption != null) {
                String fileName = deliveryOption.getFileName();
                if (fileName == null || fileName.isEmpty()) {
                    fileName = "statement_report." + engine.getFileExtension();
                }

                mailService.sendReportEmail(
                        deliveryOption.getEmailRecipients(),
                        deliveryOption.getEmailSubject(),
                        deliveryOption.getEmailMessage(),
                        fileName,
                        reportBytes,
                        engine.getContentType()
                );
            }
        } catch (Exception ex) {
            status = "FAILED";
            errorMsg = ex.getMessage();
        }

        ScheduleHistory history = new ScheduleHistory(
                UUID.randomUUID().toString(),
                schedule.getId(),
                OffsetDateTime.now(),
                status,
                recordsCount,
                errorMsg,
                recipients
        );
        historyRepository.save(history);
    }

    private ReportExportEngine resolveEngine(String format) {
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
}
