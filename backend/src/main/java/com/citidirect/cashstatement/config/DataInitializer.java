package com.citidirect.cashstatement.config;

import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.time.OffsetDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DataSource dataSource;
    private final AppUserRepository userRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DataSource dataSource,
                           AppUserRepository userRepository,
                           DeliveryOptionRepository deliveryOptionRepository,
                           PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (userRepository.count() == 0) {
                log.info("No users found in database. Initializing seed data from V2__seed_data.sql...");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("db/migration/V2__seed_data.sql"));
                populator.setContinueOnError(true);
                populator.execute(dataSource);
                log.info("Database seeding finished. User count: {}", userRepository.count());
            }

            // Ensure valid BCrypt password hashes for simulation users
            userRepository.findByUsername("maker_user").ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("testpassword"));
                userRepository.save(u);
                log.info("maker_user password hash initialized.");
            });

            userRepository.findByUsername("checker_user").ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("adminpassword"));
                userRepository.save(u);
                log.info("checker_user password hash initialized.");
            });

            if (deliveryOptionRepository.count() == 0) {
                log.info("Seeding default delivery options...");
                DeliveryOption opt1 = new DeliveryOption();
                opt1.setId("del-001");
                opt1.setName("Standard Daily E-Mail Delivery");
                opt1.setDescription("Automated daily statement dispatch via secure email channel");
                opt1.setDeliveryType("E-MAIL");
                opt1.setSecurityMethod("Citi Secure E-Mail");
                opt1.setEmailRecipients("client-statements@example.com");
                opt1.setEmailSubject("Daily Account Statement - CitiDirect");
                opt1.setEmailMessage("Please find attached your daily account statement.");
                opt1.setFileName("statement_daily.pdf");
                opt1.setAuthStatus("AUTHORIZED");
                opt1.setMakerId("usr-001");
                opt1.setCheckerId("usr-002");
                opt1.setCreatedAt(OffsetDateTime.now());
                opt1.setUpdatedAt(OffsetDateTime.now());
                deliveryOptionRepository.save(opt1);

                DeliveryOption opt2 = new DeliveryOption();
                opt2.setId("del-002");
                opt2.setName("SWIFT MT940 End-of-Day Dispatch");
                opt2.setDescription("Direct SWIFT network dispatch for corporate treasury reconciliation");
                opt2.setDeliveryType("SWIFT");
                opt2.setSecurityMethod("SWIFTNet PKI");
                opt2.setEmailRecipients("treasury-swift@example.com");
                opt2.setEmailSubject("MT940 End of Day Statement");
                opt2.setEmailMessage("MT940 Structured statement dispatch.");
                opt2.setFileName("statement_mt940.txt");
                opt2.setAuthStatus("AUTHORIZED");
                opt2.setMakerId("usr-001");
                opt2.setCheckerId("usr-002");
                opt2.setCreatedAt(OffsetDateTime.now());
                opt2.setUpdatedAt(OffsetDateTime.now());
                deliveryOptionRepository.save(opt2);

                log.info("Default delivery options seeded.");
            }
        } catch (Exception ex) {
            log.error("Failed to seed initial database data: {}", ex.getMessage(), ex);
        }
    }
}
