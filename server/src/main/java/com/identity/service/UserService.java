package com.identity.service;

import com.identity.dto.UserProfileDto;
import com.identity.model.User;
import com.identity.model.UserProfile;
import com.identity.repository.UserProfileRepository;
import com.identity.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(null);

        return mapToDto(user, profile);
    }

    @Transactional
    public UserProfileDto updateProfile(UUID userId, UserProfileDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (updateDto.getFirstName() != null) {
            profile.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            profile.setLastName(updateDto.getLastName());
        }
        if (updateDto.getPhoneNumber() != null) {
            profile.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getDateOfBirth() != null) {
            profile.setDateOfBirth(updateDto.getDateOfBirth());
        }
        if (updateDto.getAddressLine1() != null) {
            profile.setAddressLine1(updateDto.getAddressLine1());
        }
        if (updateDto.getAddressLine2() != null) {
            profile.setAddressLine2(updateDto.getAddressLine2());
        }
        if (updateDto.getCity() != null) {
            profile.setCity(updateDto.getCity());
        }
        if (updateDto.getStateProvince() != null) {
            profile.setStateProvince(updateDto.getStateProvince());
        }
        if (updateDto.getPostalCode() != null) {
            profile.setPostalCode(updateDto.getPostalCode());
        }
        if (updateDto.getCountryCode() != null) {
            profile.setCountryCode(updateDto.getCountryCode());
        }

        profile = userProfileRepository.save(profile);
        return mapToDto(user, profile);
    }

    private UserProfileDto mapToDto(User user, UserProfile profile) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setStatus(user.getStatus());

        if (profile != null) {
            dto.setFirstName(profile.getFirstName());
            dto.setLastName(profile.getLastName());
            dto.setPhoneNumber(profile.getPhoneNumber());
            dto.setDateOfBirth(profile.getDateOfBirth());
            dto.setAddressLine1(profile.getAddressLine1());
            dto.setAddressLine2(profile.getAddressLine2());
            dto.setCity(profile.getCity());
            dto.setStateProvince(profile.getStateProvince());
            dto.setPostalCode(profile.getPostalCode());
            dto.setCountryCode(profile.getCountryCode());
            dto.setUpdatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt() : OffsetDateTime.now());
        } else {
            dto.setUpdatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt() : OffsetDateTime.now());
        }

        return dto;
    }
}
