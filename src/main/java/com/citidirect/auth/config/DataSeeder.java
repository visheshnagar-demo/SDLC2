package com.citidirect.auth.config;

import com.citidirect.auth.entity.User;
import com.citidirect.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
    }

    public void seedUsers() {
        // Seed default Customer account
        if (!userRepository.existsByEmailIgnoreCase("test@example.com")) {
            User testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setFullName("Test Customer");
            testUser.setHashedPassword(passwordEncoder.encode("testpassword"));
            testUser.setRole("Customer");
            testUser.setActive(true);
            testUser.setFailedLoginCount(0);
            userRepository.save(testUser);
            logger.info("Seeded test customer account: test@example.com / testpassword");
        }

        // Seed default Admin account
        if (!userRepository.existsByEmailIgnoreCase("admin@example.com")) {
            User adminUser = new User();
            adminUser.setEmail("admin@example.com");
            adminUser.setFullName("System Admin");
            adminUser.setHashedPassword(passwordEncoder.encode("adminpassword"));
            adminUser.setRole("Admin");
            adminUser.setActive(true);
            adminUser.setFailedLoginCount(0);
            userRepository.save(adminUser);
            logger.info("Seeded admin account: admin@example.com / adminpassword");
        }
    }
}
