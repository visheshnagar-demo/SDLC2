package com.citidirect.cashstatement.scheduling;

import com.citidirect.cashstatement.criteria.model.DerivedReport;
import com.citidirect.cashstatement.criteria.repository.DerivedReportRepository;
import com.citidirect.cashstatement.delivery.MailNotificationService;
import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.engine.PdfReportEngine;
import com.citidirect.cashstatement.scheduling.model.ReportSchedule;
import com.citidirect.cashstatement.scheduling.model.ScheduleHistory;
import com.citidirect.cashstatement.scheduling.repository.ReportScheduleRepository;
import com.citidirect.cashstatement.scheduling.repository.ScheduleHistoryRepository;
import com.citidirect.cashstatement.statement.StatementAggregationService;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class QuartzReportJob implements Job {

    private final StatementAggregationService aggregationService;
    private final PdfReportEngine pdfReportEngine;
    private final MailNotificationService mailService;
    private final ReportScheduleRepository scheduleRepository;
    private final ScheduleHistoryRepository historyRepository;
    private final DerivedReportRepository derivedReportRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;

    public QuartzReportJob(StatementAggregationService aggregationService,
                           PdfReportEngine pdfReportEngine,
                           MailNotificationService mailService,
                           ReportScheduleRepository scheduleRepository,
                           ScheduleHistoryRepository historyRepository,
                           DerivedReportRepository derivedReportRepository,
                           DeliveryOptionRepository deliveryOptionRepository) {
        this.aggregationService = aggregationService;
        this.pdfReportEngine = pdfReportEngine;
        this.mailService = mailService;
        this.scheduleRepository = scheduleRepository;
        this.historyRepository = historyRepository;
        this.derivedReportRepository = derivedReportRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
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
            StatementReportData reportData = aggregationService.generateReportData(
                    schedule.getEventName(),
                    null,
                    schedule.getRunTimeUser() != null ? schedule.getRunTimeUser() : "SYSTEM"
            );

            recordsCount = reportData.getAccounts().stream()
                    .mapToInt(a -> a.getTransactions().size())
                    .sum();

            byte[] pdfBytes = pdfReportEngine.export(reportData);

            if (deliveryOption != null) {
                mailService.sendReportEmail(
                        deliveryOption.getEmailRecipients(),
                        deliveryOption.getEmailSubject(),
                        deliveryOption.getEmailMessage(),
                        deliveryOption.getFileName(),
                        pdfBytes,
                        "application/pdf"
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
}
