package com.citidirect.cashstatement;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class DeliveryOptionsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetPendingDeliveryOptions() throws Exception {
        mockMvc.perform(get("/api/delivery-options/pending")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testCreateDeliveryOption() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("channelType", "EMAIL");
        req.put("destinationTarget", "treasury-ops@citicorp.com");

        mockMvc.perform(post("/api/delivery-options")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_AUTHORIZATION"));
    }

    @Test
    public void testMakerCheckerAuthorizationSuccess() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("authorizationAction", "AUTHORIZE");
        req.put("checkerComments", "Approved SFTP endpoint configuration.");

        mockMvc.perform(post("/api/delivery-options/DEL-OPT-5510/authorize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    public void testRejectWithoutReasonFails() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("authorizationAction", "REJECT");

        mockMvc.perform(post("/api/delivery-options/DEL-OPT-5510/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
