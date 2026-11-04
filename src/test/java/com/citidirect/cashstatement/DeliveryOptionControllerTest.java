package com.citidirect.cashstatement;

import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.entity.User;
import com.citidirect.cashstatement.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class DeliveryOptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DeliveryOptionRepository deliveryOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreateDeliveryOption() throws Exception {
        DeliveryOptionDTO dto = new DeliveryOptionDTO();
        dto.setDeliveryChannel("SFTP");
        dto.setDestinationConfig(Map.of("host", "sftp.citi.com", "port", 22, "path", "/statements/"));

        mockMvc.perform(post("/api/delivery-options")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }

    @Test
    public void testAuthorizeDeliveryOptionSuccess() throws Exception {
        User maker = userRepository.findByEmail("test@example.com").orElseThrow();
        User checker = userRepository.findByEmail("checker@example.com").orElseThrow();

        DeliveryOption opt = new DeliveryOption();
        opt.setDeliveryChannel("EMAIL");
        opt.setDestinationConfig("{\"email\":\"treasury@citi.com\"}");
        opt.setStatus("PENDING_APPROVAL");
        opt.setMakerId(maker.getId());
        opt = deliveryOptionRepository.save(opt);

        AuthorizeRequestDTO authReq = new AuthorizeRequestDTO("Approved by checker");

        mockMvc.perform(post("/api/delivery-options/" + opt.getId() + "/authorize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AUTHORIZED"))
                .andExpect(jsonPath("$.checkerComments").value("Approved by checker"));
    }

    @Test
    public void testRejectDeliveryOptionSuccess() throws Exception {
        User maker = userRepository.findByEmail("test@example.com").orElseThrow();

        DeliveryOption opt = new DeliveryOption();
        opt.setDeliveryChannel("EMAIL");
        opt.setDestinationConfig("{\"email\":\"treasury@citi.com\"}");
        opt.setStatus("PENDING_APPROVAL");
        opt.setMakerId(maker.getId());
        opt = deliveryOptionRepository.save(opt);

        AuthorizeRequestDTO authReq = new AuthorizeRequestDTO("Invalid configuration");

        mockMvc.perform(post("/api/delivery-options/" + opt.getId() + "/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.checkerComments").value("Invalid configuration"));
    }

    @Test
    public void testGetPendingDeliveryOptions() throws Exception {
        mockMvc.perform(get("/api/delivery-options/pending"))
                .andExpect(status().isOk());
    }
}
