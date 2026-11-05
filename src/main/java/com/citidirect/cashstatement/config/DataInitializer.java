package com.citidirect.cashstatement.config;

import com.citidirect.cashstatement.entity.BaseReport;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.entity.GeneratedReport;
import com.citidirect.cashstatement.entity.User;
import com.citidirect.cashstatement.repository.BaseReportRepository;
import com.citidirect.cashstatement.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.repository.GeneratedReportRepository;
import com.citidirect.cashstatement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BaseReportRepository baseReportRepository;
    private final GeneratedReportRepository generatedReportRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;

    public DataInitializer(UserRepository userRepository,
                           BaseReportRepository baseReportRepository,
                           GeneratedReportRepository generatedReportRepository,
                           DeliveryOptionRepository deliveryOptionRepository) {
        this.userRepository = userRepository;
        this.baseReportRepository = baseReportRepository;
        this.generatedReportRepository = generatedReportRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedBaseReports();
        seedGeneratedReports();
        seedDeliveryOptions();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User maker = new User("usr_maker_01", "maker_user", "maker@citidirect.com", "M. Sterling (Senior Treasury Analyst)", "ROLE_MAKER");
            User checker = new User("usr_checker_01", "checker_user", "checker@citidirect.com", "J. Vance (Tier 4 Authorizer)", "ROLE_CHECKER");
            User admin = new User("usr_admin_01", "admin_user", "admin@citidirect.com", "CitiDirect Admin", "ROLE_ADMIN");
            User testUser = new User("usr_test_01", "testuser", "test@example.com", "Corporate Treasury User", "ROLE_USER");
            userRepository.saveAll(Arrays.asList(maker, checker, admin, testUser));
        }
    }

    private void seedBaseReports() {
        if (baseReportRepository.count() == 0) {
            List<BaseReport> baseReports = Arrays.asList(
                new BaseReport("rpt-001", "CASH_STMT_EOD", "End of Day Consolidated Cash Statement", "SWIFT MT940", "Cash Statement", "Daily 17:00 EST", "Pre-configured CitiDirect cash statement report template code."),
                new BaseReport("rpt-002", "INTRADAY_BAI2", "Intraday Account Activity Ledger", "BAI2 Standard", "Liquidity Feeds", "2-Hour Interval", "Intraday feed for real-time ledger accounting."),
                new BaseReport("rpt-003", "INTERIM_MT942", "Interim Balance Report", "SWIFT MT942", "Interim Balance", "Hourly", "Hourly interim statement snapshot."),
                new BaseReport("rpt-004", "SWEEP_AUDIT", "Regional Cash Sweeping & ZBA Audit", "CSV / Excel", "Reconciliation", "Daily EOD", "Zero Balance Account sweeps and reconciliation."),
                new BaseReport("rpt-005", "CAMT_053_XML", "ISO 20022 Bank-to-Customer Statement", "CAMT.053 XML", "Cash Statement", "Daily EOD", "Structured ISO20022 XML feed for global corporate treasury.")
            );
            baseReportRepository.saveAll(baseReports);
        }
    }

    private void seedGeneratedReports() {
        if (generatedReportRepository.count() == 0) {
            GeneratedReport r1 = new GeneratedReport();
            r1.setId("rpt-01");
            r1.setReportName("EOD Consolidated Cash Balance MT940");
            r1.setAccountNumbers(Arrays.asList("CITI-US-99201488"));
            r1.setBranchCode("NYC-001");
            r1.setFrequency("Daily EOD (MT940)");
            r1.setExportFormat("PDF");
            r1.setFileSizeBytes(245100L);
            r1.setStatus("COMPLETED");
            r1.setCreatedBy("M. Sterling (Maker)");

            GeneratedReport r2 = new GeneratedReport();
            r2.setId("rpt-02");
            r2.setReportName("Intraday Liquidity Ledger BAI2");
            r2.setAccountNumbers(Arrays.asList("CITI-GB-88402199"));
            r2.setBranchCode("LON-044");
            r2.setFrequency("Intraday 2h (BAI2)");
            r2.setExportFormat("PDF");
            r2.setFileSizeBytes(184000L);
            r2.setStatus("PENDING_APPROVAL");
            r2.setCreatedBy("R. Chen (Treasury Ops)");

            GeneratedReport r3 = new GeneratedReport();
            r3.setId("rpt-03");
            r3.setReportName("APAC Regional Sweeping Statement");
            r3.setAccountNumbers(Arrays.asList("CITI-SG-44109833"));
            r3.setBranchCode("SIN-012");
            r3.setFrequency("Daily EOD (MT940)");
            r3.setExportFormat("CSV");
            r3.setFileSizeBytes(95000L);
            r3.setStatus("GENERATING");
            r3.setCreatedBy("System Automated");

            GeneratedReport r4 = new GeneratedReport();
            r4.setId("rpt-04");
            r4.setReportName("EMEA Multi-Currency Reconciliation");
            r4.setAccountNumbers(Arrays.asList("CITI-DE-11029481"));
            r4.setBranchCode("FRA-009");
            r4.setFrequency("Ad-hoc (CSV)");
            r4.setExportFormat("CSV");
            r4.setFileSizeBytes(312000L);
            r4.setStatus("COMPLETED");
            r4.setCreatedBy("A. Gupta (Analyst)");

            GeneratedReport r5 = new GeneratedReport();
            r5.setId("rpt-05");
            r5.setReportName("Treasury Zero-Balance Sweep Audit");
            r5.setAccountNumbers(Arrays.asList("CITI-US-33991204"));
            r5.setBranchCode("NYC-001");
            r5.setFrequency("Daily EOD (MT940)");
            r5.setExportFormat("EXCEL");
            r5.setFileSizeBytes(154000L);
            r5.setStatus("REJECTED");
            r5.setErrorMessage("Dual-control authorization rejected by Checker: Account threshold exceeded");
            r5.setCreatedBy("K. Horvath (Maker)");

            generatedReportRepository.saveAll(Arrays.asList(r1, r2, r3, r4, r5));
        }
    }

    private void seedDeliveryOptions() {
        if (deliveryOptionRepository.count() == 0) {
            DeliveryOption d1 = new DeliveryOption();
            d1.setId("del-001");
            d1.setScheduleId("SCHED-MT940-WEEKLY-001");
            d1.setDeliveryChannel("SFTP");
            d1.setDestinationConfigJson("{\"host\":\"sftp.corporate.citi.com\",\"port\":22,\"remotePath\":\"/treasury/statements/mt940/\",\"authScheme\":\"Dual-Key PGP / SSH Certificate\",\"pgpEncryption\":true,\"pgpKeyId\":\"Citibank_Corporate_2026.pub (4096-bit RSA)\"}");
            d1.setStatus("PENDING_APPROVAL");
            d1.setMakerId("usr_maker_01");
            d1.setMakerName("M. Sterling (Senior Treasury Analyst)");

            DeliveryOption d2 = new DeliveryOption();
            d2.setId("del-002");
            d2.setScheduleId("SCHED-BAI2-INTRADAY-002");
            d2.setDeliveryChannel("SFTP");
            d2.setDestinationConfigJson("{\"host\":\"sftp.lon.citigroup.net\",\"port\":2222,\"remotePath\":\"/feeds/intraday/bai2/\",\"authScheme\":\"SSH-RSA Key\",\"pgpEncryption\":true}");
            d2.setStatus("PENDING_APPROVAL");
            d2.setMakerId("usr_maker_02");
            d2.setMakerName("R. Chen (Treasury Ops)");

            DeliveryOption d3 = new DeliveryOption();
            d3.setId("del-003");
            d3.setScheduleId("SCHED-ZBA-DAILY-003");
            d3.setDeliveryChannel("EMAIL");
            d3.setDestinationConfigJson("{\"emailRecipients\":[\"treasury-ops@corp-client.com\",\"recon-desk@corp-client.com\"],\"pgpEncryption\":true}");
            d3.setStatus("PENDING_APPROVAL");
            d3.setMakerId("usr_maker_03");
            d3.setMakerName("K. Horvath (Maker)");

            deliveryOptionRepository.saveAll(Arrays.asList(d1, d2, d3));
        }
    }
}
