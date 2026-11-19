package com.sdlc.identity;

import com.sdlc.identity.model.Role;
import com.sdlc.identity.model.User;
import com.sdlc.identity.model.UserStatus;
import com.sdlc.identity.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootApplication
public class IdentityApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdentityApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed default customer user
            if (!userRepository.existsByEmailIgnoreCase("test@example.com")) {
                User testUser = new User();
                testUser.setId(UUID.randomUUID().toString());
                testUser.setEmail("test@example.com");
                testUser.setPasswordHash(passwordEncoder.encode("testpassword"));
                testUser.setFullName("Test Customer");
                testUser.setRole(Role.ROLE_CUSTOMER);
                testUser.setStatus(UserStatus.APPROVED);
                testUser.setActive(true);
                testUser.setCreatedAt(LocalDateTime.now());
                testUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(testUser);
            }

            // Seed default admin user
            if (!userRepository.existsByEmailIgnoreCase("admin@example.com")) {
                User adminUser = new User();
                adminUser.setId(UUID.randomUUID().toString());
                adminUser.setEmail("admin@example.com");
                adminUser.setPasswordHash(passwordEncoder.encode("adminpassword"));
                adminUser.setFullName("Admin User");
                adminUser.setRole(Role.ROLE_ADMIN);
                adminUser.setStatus(UserStatus.APPROVED);
                adminUser.setActive(true);
                adminUser.setCreatedAt(LocalDateTime.now());
                adminUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(adminUser);
            }
        };
    }
}
