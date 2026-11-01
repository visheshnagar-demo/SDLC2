package com.citidirect.cashstatement.auth;

import com.citidirect.cashstatement.auth.dto.AuthResponse;
import com.citidirect.cashstatement.auth.dto.EntitlementsResponse;
import com.citidirect.cashstatement.auth.dto.LoginRequest;
import com.citidirect.cashstatement.auth.dto.UserDto;
import com.citidirect.cashstatement.masterdata.model.AppUser;
import com.citidirect.cashstatement.masterdata.model.UserEntitlement;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.masterdata.repository.UserEntitlementRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService implements UserDetailsService {

    private final AppUserRepository userRepository;
    private final UserEntitlementRepository entitlementRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AppUserRepository userRepository,
                       UserEntitlementRepository entitlementRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.entitlementRepository = entitlementRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.isActive()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        AppUser user = userRepository.findByUsername(loginRequest.getUsername())
                .or(() -> userRepository.findByEmail(loginRequest.getUsername()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("User account is inactive");
        }

        // Strictly verify password using secure PasswordEncoder (BCrypt) - no backdoor paths allowed
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        UserPrincipal principal = new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.isActive()
        );

        String token = tokenProvider.generateToken(principal);
        UserDto userDto = new UserDto(user.getId(), user.getUsername(), user.getFullName(), user.getEmail(), user.getRole());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public EntitlementsResponse getUserEntitlements(String userId) {
        List<UserEntitlement> entitlements = entitlementRepository.findByUserId(userId);

        List<String> branches = entitlements.stream()
                .filter(e -> "BRANCH".equalsIgnoreCase(e.getEntityType()))
                .map(UserEntitlement::getEntityId)
                .collect(Collectors.toList());

        List<String> customers = entitlements.stream()
                .filter(e -> "CUSTOMER".equalsIgnoreCase(e.getEntityType()))
                .map(UserEntitlement::getEntityId)
                .collect(Collectors.toList());

        List<String> accounts = entitlements.stream()
                .filter(e -> "ACCOUNT".equalsIgnoreCase(e.getEntityType()))
                .map(UserEntitlement::getEntityId)
                .collect(Collectors.toList());

        return new EntitlementsResponse(branches, customers, accounts);
    }
}
