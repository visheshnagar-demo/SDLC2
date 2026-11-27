package com.identity.config;

import com.identity.model.User;
import com.identity.model.UserProfile;
import com.identity.repository.UserProfileRepository;
import com.identity.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Seed default test user: test@example.com / testpassword
        if (!userRepository.existsByEmail("test@example.com")) {
            User testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setPasswordHash(passwordEncoder.encode("testpassword"));
            testUser.setStatus("ACTIVE");
            testUser.setEmailVerified(true);
            testUser.setRole("ROLE_CUSTOMER");
            testUser = userRepository.save(testUser);

            UserProfile profile = new UserProfile();
            profile.setUser(testUser);
            profile.setFirstName("Jane");
            profile.setLastName("Doe");
            profile.setPhoneNumber("+1234567890");
            profile.setDateOfBirth(LocalDate.of(1990, 1, 15));
            profile.setAddressLine1("123 Main St");
            profile.setAddressLine2("Apt 4B");
            profile.setCity("New York");
            profile.setStateProvince("NY");
            profile.setPostalCode("10001");
            profile.setCountryCode("USA");
            userProfileRepository.save(profile);
        }

        // Seed default admin user: admin@example.com / adminpassword
        if (!userRepository.existsByEmail("admin@example.com")) {
            User adminUser = new User();
            adminUser.setEmail("admin@example.com");
            adminUser.setPasswordHash(passwordEncoder.encode("adminpassword"));
            adminUser.setStatus("ACTIVE");
            adminUser.setEmailVerified(true);
            adminUser.setRole("ROLE_ADMIN");
            adminUser = userRepository.save(adminUser);

            UserProfile adminProfile = new UserProfile();
            adminProfile.setUser(adminUser);
            adminProfile.setFirstName("System");
            adminProfile.setLastName("Admin");
            adminProfile.setPhoneNumber("+1000000000");
            adminProfile.setCity("Headquarters");
            adminProfile.setCountryCode("USA");
            userProfileRepository.save(adminProfile);
        }
    }
}
