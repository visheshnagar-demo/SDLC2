package com.citidirect.cashstatement.config;

import com.citidirect.cashstatement.entity.*;
import com.citidirect.cashstatement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final ReportCriteriaRepository criteriaRepository;
    private final StatementReportRepository reportRepository;
    private final StatementLineItemRepository lineItemRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ReportScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AppUserRepository userRepository,
                           ReportCriteriaRepository criteriaRepository,
                           StatementReportRepository reportRepository,
                           StatementLineItemRepository lineItemRepository,
                           DeliveryOptionRepository deliveryOptionRepository,
                           ReportScheduleRepository scheduleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.criteriaRepository = criteriaRepository;
        this.reportRepository = reportRepository;
        this.lineItemRepository = lineItemRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.scheduleRepository = scheduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed users if empty
        if (userRepository.count() == 0) {
            AppUser testUser = new AppUser(
                "user-maker-01",
                "testuser",
                "test@example.com",
                passwordEncoder.encode("testpassword"),
                "Test Corporate Maker",
                "ROLE_MAKER",
                "BR-SG-001",
                true
            );
            userRepository.save(testUser);

            AppUser adminUser = new AppUser(
                "user-checker-01",
                "adminuser",
                "admin@example.com",
                passwordEncoder.encode("adminpassword"),
                "Admin Corporate Checker",
                "ROLE_CHECKER",
                "BR-SG-001",
                true
            );
            userRepository.save(adminUser);

            AppUser makerUser = new AppUser(
                "user-maker-02",
                "makeruser",
                "maker@citi.com",
                passwordEncoder.encode("makerpassword"),
                "Jane Maker",
                "ROLE_MAKER",
                "BR-SG-001",
                true
            );
            userRepository.save(makerUser);

            AppUser checkerUser = new AppUser(
                "user-checker-02",
                "checkeruser",
                "checker@citi.com",
                passwordEncoder.encode("checkerpassword"),
                "John Checker",
                "ROLE_CHECKER",
                "BR-SG-001",
                true
            );
            userRepository.save(checkerUser);
        }

        // Seed sample report criteria and statement reports if empty
        if (reportRepository.count() == 0) {
            ReportCriteria criteria = new ReportCriteria();
            criteria.setId("CRIT-001");
            criteria.setCreatedBy("user-maker-01");
            criteria.setCustomerId("CUST-99201");
            criteria.setBranchCode("SG001");
            criteria.setAccountNumber("8829102931");
            criteria.setCurrency("USD");
            criteria.setDateMatrixType("PREVIOUS_BUSINESS_DAY");
            criteria.setStatementDate("2026-11-02");
            criteria.setValueDate("2026-11-02");
            criteria.setReportTemplateId("REP-CASH-STMT-01");
            criteria.setReportName("Account Statement - Comprehensive");
            criteria.setDesignatedOwner("APAC Treasury");
            criteria.setBankReference("CITI-SG-REF-8812");
            criteria.setCustomerReference("CUST-APAC-001");
            criteria.setServiceClassId("SVC-CLS-01");
            criteriaRepository.save(criteria);

            StatementReport report1 = new StatementReport();
            report1.setId("REP-1001");
            report1.setCriteriaId("CRIT-001");
            report1.setReportName("Account Statement - Comprehensive");
            report1.setReportType("CASH_STATEMENT");
            report1.setBranchCode("SG001");
            report1.setCustomerId("CUST-99201");
            report1.setAccountNumber("8829102931");
            report1.setCurrency("USD");
            report1.setGenerationStatus("COMPLETED");
            report1.setOpeningBalance(new BigDecimal("1250000.00"));
            report1.setTotalDebits(new BigDecimal("185000.00"));
            report1.setTotalCredits(new BigDecimal("340000.00"));
            report1.setClosingBalance(new BigDecimal("1405000.00"));
            report1.setStatementDate("2026-11-02");
            report1.setGeneratedAt(Instant.now());
            reportRepository.save(report1);

            // Add 9-column ledger line items
            StatementLineItem item1 = new StatementLineItem();
            item1.setId("LINE-001");
            item1.setReportId("REP-1001");
            item1.setTxnDate("2026-11-02");
            item1.setValueDate("2026-11-02");
            item1.setTxnReference("TXN-20261102-001");
            item1.setDescription("Vendor Wire Payment - Supplier Global Ltd");
            item1.setDebitAmount(new BigDecimal("125000.00"));
            item1.setCreditAmount(BigDecimal.ZERO);
            item1.setBalanceAfter(new BigDecimal("1125000.00"));
            lineItemRepository.save(item1);

            StatementLineItem item2 = new StatementLineItem();
            item2.setId("LINE-002");
            item2.setReportId("REP-1001");
            item2.setTxnDate("2026-11-02");
            item2.setValueDate("2026-11-02");
            item2.setTxnReference("TXN-20261102-002");
            item2.setDescription("Inward Customer Liquidity Transfer - US Entity");
            item2.setDebitAmount(BigDecimal.ZERO);
            item2.setCreditAmount(new BigDecimal("340000.00"));
            item2.setBalanceAfter(new BigDecimal("1465000.00"));
            lineItemRepository.save(item2);

            StatementLineItem item3 = new StatementLineItem();
            item3.setId("LINE-003");
            item3.setReportId("REP-1001");
            item3.setTxnDate("2026-11-02");
            item3.setValueDate("2026-11-02");
            item3.setTxnReference("TXN-20261102-003");
            item3.setDescription("Treasury Interest Settlement & Clearing Fee");
            item3.setDebitAmount(new BigDecimal("60000.00"));
            item3.setCreditAmount(BigDecimal.ZERO);
            item3.setBalanceAfter(new BigDecimal("1405000.00"));
            lineItemRepository.save(item3);

            // Report 2
            StatementReport report2 = new StatementReport();
            report2.setId("REP-1002");
            report2.setCriteriaId("CRIT-001");
            report2.setReportName("Daily Intraday Cash Position");
            report2.setReportType("INTRADAY_POSITION");
            report2.setBranchCode("HK002");
            report2.setCustomerId("CUST-99201");
            report2.setAccountNumber("8829102932");
            report2.setCurrency("HKD");
            report2.setGenerationStatus("COMPLETED");
            report2.setOpeningBalance(new BigDecimal("5000000.00"));
            report2.setTotalDebits(new BigDecimal("450000.00"));
            report2.setTotalCredits(new BigDecimal("820000.00"));
            report2.setClosingBalance(new BigDecimal("5370000.00"));
            report2.setStatementDate("2026-11-03");
            report2.setGeneratedAt(Instant.now());
            reportRepository.save(report2);
        }

        // Seed delivery options if empty
        if (deliveryOptionRepository.count() == 0) {
            DeliveryOption del1 = new DeliveryOption();
            del1.setId("DEL-OPT-5510");
            del1.setChannelType("SFTP");
            del1.setDestinationTarget("sftp.corp.citigroup.com:22");
            del1.setSftpFolderPath("/inbound/treasury/statements");
            del1.setEncryptionProtocol("TLS_1_3");
            del1.setSshKeyMethod("ED25519");
            del1.setStatus("PENDING_AUTHORIZATION");
            del1.setMakerId("user-maker-01");
            deliveryOptionRepository.save(del1);

            DeliveryOption del2 = new DeliveryOption();
            del2.setId("DEL-OPT-5511");
            del2.setChannelType("EMAIL");
            del2.setDestinationTarget("apac-treasury-reports@clientcorp.com");
            del2.setStatus("AUTHORIZED");
            del2.setMakerId("user-maker-01");
            del2.setCheckerId("user-checker-01");
            deliveryOptionRepository.save(del2);
        }

        // Seed schedules if empty
        if (scheduleRepository.count() == 0) {
            ReportSchedule sched1 = new ReportSchedule();
            sched1.setId("SCHED-1029");
            sched1.setScheduleName("Daily APAC Treasury Statement");
            sched1.setCriteriaId("CRIT-001");
            sched1.setDeliveryOptionId("DEL-OPT-5510");
            sched1.setFrequency("DAILY");
            sched1.setCronExpression("0 0 8 * * ?");
            sched1.setStartDate("2026-11-01");
            sched1.setStartTime("08:00");
            sched1.setStatus("PENDING_AUTHORIZATION");
            sched1.setMakerId("user-maker-01");
            scheduleRepository.save(sched1);

            ReportSchedule sched2 = new ReportSchedule();
            sched2.setId("SCHED-1030");
            sched2.setScheduleName("Weekly Global Liquidity Reconciliation");
            sched2.setCriteriaId("CRIT-001");
            sched2.setDeliveryOptionId("DEL-OPT-5511");
            sched2.setFrequency("WEEKLY");
            sched2.setCronExpression("0 0 18 ? * FRI");
            sched2.setStartDate("2026-11-01");
            sched2.setStartTime("18:00");
            sched2.setStatus("AUTHORIZED");
            sched2.setMakerId("user-maker-01");
            sched2.setCheckerId("user-checker-01");
            scheduleRepository.save(sched2);
        }
    }
}
