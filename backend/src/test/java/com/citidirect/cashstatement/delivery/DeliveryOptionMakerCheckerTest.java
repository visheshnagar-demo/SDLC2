package com.citidirect.cashstatement.delivery;

import com.citidirect.cashstatement.delivery.dto.AuthorizationRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionResponse;
import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DeliveryOptionMakerCheckerTest {

    @Mock
    private DeliveryOptionRepository deliveryOptionRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private DeliveryOptionService deliveryOptionService;

    private DeliveryOption option;

    @BeforeEach
    void setUp() {
        option = new DeliveryOption();
        option.setId("opt-123");
        option.setName("Treasury_Daily_EOD");
        option.setDescription("Daily automated statement");
        option.setDeliveryType("E-MAIL");
        option.setSecurityMethod("Citi Secure E-Mail");
        option.setEmailRecipients("treasury@client.com;controller@client.com");
        option.setEmailSubject("CitiDirect Statement");
        option.setFileName("statement.pdf");
        option.setAuthStatus("PENDING_AUTHORIZATION");
        option.setMakerId("usr-maker-1");
    }

    @Test
    @DisplayName("Maker cannot authorize own delivery option (Segregation of Duties enforcement)")
    void testMakerCannotSelfAuthorize() {
        when(deliveryOptionRepository.findById("opt-123")).thenReturn(Optional.of(option));

        AuthorizationRequest authReq = new AuthorizationRequest("AUTHORIZE", "Looks good");

        // Attempt by maker (usr-maker-1) should fail
        assertThrows(IllegalStateException.class, () -> {
            deliveryOptionService.authorizeDeliveryOption("opt-123", authReq, "usr-maker-1");
        });
    }

    @Test
    @DisplayName("Independent Checker can authorize delivery option successfully")
    void testIndependentCheckerCanAuthorize() {
        when(deliveryOptionRepository.findById("opt-123")).thenReturn(Optional.of(option));
        when(deliveryOptionRepository.save(any(DeliveryOption.class))).thenAnswer(i -> i.getArgument(0));

        AuthorizationRequest authReq = new AuthorizationRequest("AUTHORIZE", "Approved by Checker");

        DeliveryOptionResponse resp = deliveryOptionService.authorizeDeliveryOption("opt-123", authReq, "usr-checker-2");

        assertNotNull(resp);
        assertEquals("AUTHORIZED", resp.getAuthStatus());
        assertEquals("usr-checker-2", resp.getCheckerId());
    }

    @Test
    @DisplayName("Independent Checker can reject delivery option with rejection reason")
    void testIndependentCheckerCanReject() {
        when(deliveryOptionRepository.findById("opt-123")).thenReturn(Optional.of(option));
        when(deliveryOptionRepository.save(any(DeliveryOption.class))).thenAnswer(i -> i.getArgument(0));

        AuthorizationRequest authReq = new AuthorizationRequest("REJECT", "Recipient domain invalid");

        DeliveryOptionResponse resp = deliveryOptionService.authorizeDeliveryOption("opt-123", authReq, "usr-checker-2");

        assertNotNull(resp);
        assertEquals("REJECTED", resp.getAuthStatus());
        assertEquals("Recipient domain invalid", resp.getRejectionReason());
    }
}
