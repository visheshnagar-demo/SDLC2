package com.citidirect.cashstatement;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testSearchReports() throws Exception {
        mockMvc.perform(get("/api/reports")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testGenerateReport() throws Exception {
        mockMvc.perform(post("/api/reports/CRIT-001/generate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportName").isNotEmpty())
                .andExpect(jsonPath("$.lineItems").isArray());
    }

    @Test
    public void testExportPdf() throws Exception {
        mockMvc.perform(get("/api/reports/REP-1001/export?format=PDF"))
                .andExpect(status().isOk());
    }

    @Test
    public void testExportExcel() throws Exception {
        mockMvc.perform(get("/api/reports/REP-1001/export?format=EXCEL"))
                .andExpect(status().isOk());
    }

    @Test
    public void testExportCsv() throws Exception {
        mockMvc.perform(get("/api/reports/REP-1001/export?format=CSV"))
                .andExpect(status().isOk());
    }
}
