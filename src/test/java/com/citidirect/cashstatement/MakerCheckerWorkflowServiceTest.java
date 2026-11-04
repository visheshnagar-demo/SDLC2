package com.citidirect.cashstatement;

import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.service.MakerCheckerWorkflowService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MakerCheckerWorkflowServiceTest {

    @Autowired
    private MakerCheckerWorkflowService makerCheckerWorkflowService;

    @Test
    public void testMakerCheckerSelfApprovalForbidden() {
        DeliveryOptionDTO dto = new DeliveryOptionDTO();
        dto.setDeliveryChannel("EMAIL");
        dto.setDestinationConfig(Map.of("email", "treasury@corp.com"));

        String makerId = "user-maker-001";
        DeliveryOption opt = makerCheckerWorkflowService.createDeliveryOption(dto, makerId, "127.0.0.1");

        assertNotNull(opt.getId());
        assertEquals("PENDING_APPROVAL", opt.getStatus());

        // Attempting to authorize by the maker must throw IllegalStateException
        AuthorizeRequestDTO authReq = new AuthorizeRequestDTO("Self approval test");
        assertThrows(IllegalStateException.class, () -> {
            makerCheckerWorkflowService.authorizeDeliveryOption(opt.getId(), authReq, makerId, "127.0.0.1");
        });
    }

    @Test
    public void testMakerCheckerDualControlDistinctChecker() {
        DeliveryOptionDTO dto = new DeliveryOptionDTO();
        dto.setDeliveryChannel("SFTP");
        dto.setDestinationConfig(Map.of("host", "sftp.bank.com"));

        String makerId = "user-maker-002";
        String checkerId = "user-checker-002";
        DeliveryOption opt = makerCheckerWorkflowService.createDeliveryOption(dto, makerId, "127.0.0.1");

        AuthorizeRequestDTO authReq = new AuthorizeRequestDTO("Valid dual control approval");
        DeliveryOption authorized = makerCheckerWorkflowService.authorizeDeliveryOption(opt.getId(), authReq, checkerId, "127.0.0.1");

        assertEquals("AUTHORIZED", authorized.getStatus());
        assertEquals(checkerId, authorized.getCheckerId());
        assertNotNull(authorized.getAuthorizedAt());
    }
}
