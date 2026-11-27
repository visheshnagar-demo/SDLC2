package com.identity.controller;

import com.identity.dto.UserProfileDto;
import com.identity.model.User;
import com.identity.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal User user) {
        UserProfileDto profile = userService.getProfile(user.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(@AuthenticationPrincipal User user,
                                                        @RequestBody UserProfileDto updateDto) {
        UserProfileDto updatedProfile = userService.updateProfile(user.getId(), updateDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @PatchMapping
    public ResponseEntity<UserProfileDto> patchProfile(@AuthenticationPrincipal User user,
                                                         @RequestBody UserProfileDto updateDto) {
        UserProfileDto updatedProfile = userService.updateProfile(user.getId(), updateDto);
        return ResponseEntity.ok(updatedProfile);
    }
}
