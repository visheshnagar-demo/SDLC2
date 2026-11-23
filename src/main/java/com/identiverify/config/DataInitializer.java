package com.identiverify.config;

import com.identiverify.entity.User;
import com.identiverify.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
    }

    public void seedUsers() {
        seedUserIfNotExists("admin@example.com", "adminpassword", "System Administrator", "ADMIN");
        seedUserIfNotExists("officer@example.com", "officerpassword", "Compliance Officer Jane", "COMPLIANCE_OFFICER");
        seedUserIfNotExists("test@example.com", "testpassword", "Alexander James Montgomery", "CUSTOMER");
    }

    private void seedUserIfNotExists(String email, String rawPassword, String fullName, String role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setActive(true);
            user.setVerified(true);
            user.setPhoneNumber("+15550192834");
            user.setDateOfBirth("1990-05-15");
            user.setAddress("742 Evergreen Terrace, Springfield, OR");
            user.setTaxId("XXX-XX-1234");
            userRepository.save(user);
        }
    }
}
