package com.sdlc.identity.config;

import com.sdlc.identity.model.Role;
import com.sdlc.identity.model.User;
import com.sdlc.identity.model.UserStatus;
import com.sdlc.identity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUserIfNotFound("test@example.com", "testpassword", "Test Customer", Role.ROLE_CUSTOMER, UserStatus.APPROVED);
        seedUserIfNotFound("admin@example.com", "adminpassword", "System Admin", Role.ROLE_ADMIN, UserStatus.APPROVED);
        seedUserIfNotFound("compliance@example.com", "compliancepassword", "Compliance Officer", Role.ROLE_COMPLIANCE_OFFICER, UserStatus.APPROVED);
    }

    private void seedUserIfNotFound(String email, String rawPassword, String fullName, Role role, UserStatus status) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setRole(role);
            user.setStatus(status);
            user.setActive(true);
            userRepository.save(user);
            logger.info("Seeded user account: {} with role: {}", email, role);
        }
    }
}
