package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DeliveryOptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetPendingDeliveryOptions() throws Exception {
        mockMvc.perform(get("/api/delivery-options/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].status", is("PENDING_APPROVAL")));
    }

    @Test
    public void testCreateDeliveryOption() throws Exception {
        DeliveryOptionDTO dto = new DeliveryOptionDTO();
        dto.setScheduleId("SCHED-TEST-001");
        dto.setDeliveryChannel("SFTP");
        Map<String, Object> config = new HashMap<>();
        config.put("host", "sftp.test.citi.com");
        config.put("port", 22);
        dto.setDestinationConfig(config);
        dto.setMakerId("usr_maker_01");
        dto.setMakerName("M. Sterling (Senior Treasury Analyst)");

        mockMvc.perform(post("/api/delivery-options")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status", is("PENDING_APPROVAL")))
                .andExpect(jsonPath("$.deliveryChannel", is("SFTP")));
    }

    @Test
    @WithMockUser(username = "usr_checker_01", roles = {"CHECKER"})
    public void testAuthorizeDeliveryOptionSuccess() throws Exception {
        AuthorizeRequestDTO request = new AuthorizeRequestDTO("Approved for operational use");

        mockMvc.perform(post("/api/delivery-options/del-001/authorize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.checkerComments", is("Approved for operational use")));
    }

    @Test
    @WithMockUser(username = "usr_maker_01", roles = {"MAKER"})
    public void testAuthorizeDeliveryOptionSelfApprovalForbidden() throws Exception {
        // del-001 makerId is usr_maker_01. Current user is usr_maker_01 -> Dual-control violation!
        AuthorizeRequestDTO request = new AuthorizeRequestDTO("Self approval attempt");

        mockMvc.perform(post("/api/delivery-options/del-001/authorize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "usr_checker_01", roles = {"CHECKER"})
    public void testRejectDeliveryOption() throws Exception {
        AuthorizeRequestDTO request = new AuthorizeRequestDTO("Rejected: Invalid host path");

        mockMvc.perform(post("/api/delivery-options/del-002/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.checkerComments", is("Rejected: Invalid host path")));
    }
}
