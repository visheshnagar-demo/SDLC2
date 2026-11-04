package com.citidirect.cashstatement;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class LookupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetBranches() throws Exception {
        mockMvc.perform(get("/api/lookup/branches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].code").exists())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testGetCustomers() throws Exception {
        mockMvc.perform(get("/api/lookup/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testGetAccounts() throws Exception {
        mockMvc.perform(get("/api/lookup/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].accountNumber").exists())
                .andExpect(jsonPath("$[0].currency").exists())
                .andExpect(jsonPath("$[0].balance").exists());
    }

    @Test
    public void testGetReportNames() throws Exception {
        mockMvc.perform(get("/api/lookup/report-names"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].code").exists());
    }
}
