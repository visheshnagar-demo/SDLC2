package com.citidirect.cashstatement;

import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetReports() throws Exception {
        mockMvc.perform(get("/api/reports?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.total_elements").exists());
    }

    @Test
    public void testGenerateReport() throws Exception {
        ReportRequestDTO dto = new ReportRequestDTO();
        dto.setName("Test Statement Report");
        dto.setBranchCode("BR-NYC-001");
        dto.setAccountNumbers(List.of("ACC-100234"));
        dto.setCurrency("USD");
        dto.setDateFrom(LocalDate.of(2026, 5, 1));
        dto.setDateTo(LocalDate.of(2026, 5, 18));
        dto.setExportFormat("PDF");

        mockMvc.perform(post("/api/reports/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.report_id").exists())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    public void testScheduleReport() throws Exception {
        ReportScheduleDTO dto = new ReportScheduleDTO();
        dto.setFrequency("WEEKLY");
        dto.setCronExpression("0 0 8 ? * MON");
        dto.setExecutionTimeUtc("08:00:00");
        dto.setExportFormat("PDF");

        mockMvc.perform(post("/api/reports/schedule")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }

    @Test
    public void testExportPdfReport() throws Exception {
        mockMvc.perform(get("/api/reports/sample-id-123/export?format=PDF"))
                .andExpect(status().isOk());
    }

    @Test
    public void testExportExcelReport() throws Exception {
        mockMvc.perform(get("/api/reports/sample-id-123/export?format=EXCEL"))
                .andExpect(status().isOk());
    }

    @Test
    public void testExportCsvReport() throws Exception {
        mockMvc.perform(get("/api/reports/sample-id-123/export?format=CSV"))
                .andExpect(status().isOk());
    }
}
