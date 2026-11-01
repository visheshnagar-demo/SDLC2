package com.citidirect.cashstatement.auth;

import com.citidirect.cashstatement.auth.dto.AuthResponse;
import com.citidirect.cashstatement.auth.dto.EntitlementsResponse;
import com.citidirect.cashstatement.auth.dto.LoginRequest;
import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;
import com.citidirect.cashstatement.masterdata.model.Account;
import com.citidirect.cashstatement.masterdata.model.AppUser;
import com.citidirect.cashstatement.masterdata.model.UserEntitlement;
import com.citidirect.cashstatement.masterdata.repository.AccountRepository;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.masterdata.repository.UserEntitlementRepository;
import com.citidirect.cashstatement.statement.StatementAggregationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthAndEntitlementsTest {

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private UserEntitlementRepository entitlementRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AccountRepository accountRepository;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @InjectMocks
    private StatementAggregationService statementService;

    private AppUser makerUser;
    private AppUser checkerUser;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, entitlementRepository, passwordEncoder, tokenProvider);

        // maker_user password is 'testpassword'
        makerUser = new AppUser(
                "usr-001",
                "maker_user",
                "JUSTIN,JOHN",
                "test@example.com",
                passwordEncoder.encode("testpassword"),
                "ROLE_MAKER",
                true
        );

        // checker_user password is 'adminpassword'
        checkerUser = new AppUser(
                "usr-002",
                "checker_user",
                "SMITH,SARAH",
                "admin@example.com",
                passwordEncoder.encode("adminpassword"),
                "ROLE_AUTHORIZER",
                true
        );
    }

    @Test
    @DisplayName("Valid credentials successfully authenticate and return JWT token")
    void testValidCredentialsLogin() {
        when(userRepository.findByUsername("maker_user")).thenReturn(Optional.of(makerUser));
        when(tokenProvider.generateToken(any())).thenReturn("mocked.jwt.token");

        LoginRequest req = new LoginRequest("maker_user", "testpassword");
        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mocked.jwt.token", resp.getToken());
        assertEquals("maker_user", resp.getUser().getUsername());
        assertEquals("ROLE_MAKER", resp.getUser().getRole());
    }

    @Test
    @DisplayName("Shared/backdoor password fails when attempting to login as checker user with maker password")
    void testSharedPasswordBackdoorRejected() {
        when(userRepository.findByUsername("checker_user")).thenReturn(Optional.of(checkerUser));

        // Attempting to login to checker_user with 'testpassword' or backdoor string
        LoginRequest req = new LoginRequest("checker_user", "testpassword");

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(req);
        });
    }

    @Test
    @DisplayName("Invalid password fails authentication")
    void testInvalidPasswordRejected() {
        when(userRepository.findByUsername("maker_user")).thenReturn(Optional.of(makerUser));

        LoginRequest req = new LoginRequest("maker_user", "WrongPassword123!");

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(req);
        });
    }

    @Test
    @DisplayName("User Entitlements returns exact user accounts without fallback broadening")
    void testUserEntitlementsNoBroadening() {
        UserEntitlement ent = new UserEntitlement("ent-1", "usr-001", "ACCOUNT", "XX12CITI11223344446677");
        when(entitlementRepository.findByUserId("usr-001")).thenReturn(List.of(ent));

        EntitlementsResponse entitlements = authService.getUserEntitlements("usr-001");

        assertNotNull(entitlements);
        assertEquals(1, entitlements.getAccounts().size());
        assertEquals("XX12CITI11223344446677", entitlements.getAccounts().get(0));
    }

    @Test
    @DisplayName("Empty user entitlements returns empty list rather than sample accounts")
    void testEmptyUserEntitlementsReturnsEmpty() {
        when(entitlementRepository.findByUserId("usr-unentitled")).thenReturn(List.of());

        EntitlementsResponse entitlements = authService.getUserEntitlements("usr-unentitled");

        assertNotNull(entitlements);
        assertTrue(entitlements.getAccounts().isEmpty());
    }

    @Test
    @DisplayName("Statement report execution rejects unauthorized account access with AccessDeniedException")
    void testUnauthorizedAccountAccessRejected() {
        when(userRepository.findByUsername("maker_user")).thenReturn(Optional.of(makerUser));
        when(entitlementRepository.findByUserId("usr-001")).thenReturn(List.of(
                new UserEntitlement("ent-1", "usr-001", "ACCOUNT", "XX12CITI11223344446677")
        ));

        CriteriaPayload criteria = new CriteriaPayload();
        // Request an account the user is not entitled to
        criteria.setAccountNumber("UNAUTHORIZED_ACCOUNT_9999");

        assertThrows(AccessDeniedException.class, () -> {
            statementService.generateReportData("Account Statement – Comprehensive", criteria, "maker_user");
        });
    }
}
