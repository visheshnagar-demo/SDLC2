package com.citidirect.cashstatement.config;

import com.citidirect.cashstatement.entity.BaseReport;
import com.citidirect.cashstatement.entity.GeneratedReport;
import com.citidirect.cashstatement.entity.User;
import com.citidirect.cashstatement.repository.BaseReportRepository;
import com.citidirect.cashstatement.repository.GeneratedReportRepository;
import com.citidirect.cashstatement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BaseReportRepository baseReportRepository;
    private final GeneratedReportRepository generatedReportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           BaseReportRepository baseReportRepository,
                           GeneratedReportRepository generatedReportRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.baseReportRepository = baseReportRepository;
        this.generatedReportRepository = generatedReportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedBaseReports();
        seedSampleReports();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("test@example.com")) {
            User maker = new User(
                "maker_user",
                "test@example.com",
                "Corporate Treasury Maker",
                passwordEncoder.encode("testpassword"),
                "ROLE_MAKER"
            );
            userRepository.save(maker);
        }

        if (!userRepository.existsByEmail("checker@example.com")) {
            User checker = new User(
                "checker_user",
                "checker@example.com",
                "Senior Treasury Checker",
                passwordEncoder.encode("checkerpassword"),
                "ROLE_CHECKER"
            );
            userRepository.save(checker);
        }

        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User(
                "admin_user",
                "admin@example.com",
                "Security Administrator",
                passwordEncoder.encode("adminpassword"),
                "ROLE_ADMIN"
            );
            userRepository.save(admin);
        }
    }

    private void seedBaseReports() {
        if (baseReportRepository.count() == 0) {
            List<BaseReport> templates = List.of(
                new BaseReport("CASH_STMT_EOD", "End of Day Cash Statement", "Standard Statements", "Comprehensive end of day cash ledger with closing balance."),
                new BaseReport("CASH_STMT_INTRADAY", "Intra-Day Cash Statement", "Intra-Day Reporting", "Real-time intra-day statement capturing posted and pending debits/credits."),
                new BaseReport("CASH_STMT_MULTI_CURR", "Multi-Currency Cash Position", "Treasury Positioning", "Consolidated multi-currency cash positioning across domestic and offshore accounts."),
                new BaseReport("CASH_STMT_INTERCOMPANY", "Intercompany Settlement Report", "Corporate Treasury", "Detailed intercompany sweeping and zero-balance account reconciliation ledger."),
                new BaseReport("CASH_STMT_AUDIT_TRAIL", "Comprehensive Audit Statement", "Compliance & Audit", "Regulatory compliant transaction audit statement with full counterpart metadata.")
            );
            baseReportRepository.saveAll(templates);
        }
    }

    private void seedSampleReports() {
        if (generatedReportRepository.count() == 0) {
            User defaultUser = userRepository.findByEmail("test@example.com").orElse(null);
            String userId = defaultUser != null ? defaultUser.getId() : "system";

            List<GeneratedReport> samples = List.of(
                new GeneratedReport("Daily Cash Summary - ACC-100234", "PDF", "COMPLETED", userId),
                new GeneratedReport("Intra-Day Statement - ACC-100567", "EXCEL", "COMPLETED", userId),
                new GeneratedReport("Treasury Close Ledger - Global Accounts", "CSV", "COMPLETED", userId),
                new GeneratedReport("Weekly Consolidated Cash Position", "PDF", "GENERATING", userId)
            );
            generatedReportRepository.saveAll(samples);
        }
    }
}
