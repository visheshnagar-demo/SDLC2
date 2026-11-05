package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetReports() throws Exception {
        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].reportName", notNullValue()));
    }

    @Test
    public void testGetReportsWithFilter() throws Exception {
        mockMvc.perform(get("/api/reports")
                .param("status", "COMPLETED")
                .param("branch", "NYC-001"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGenerateReport() throws Exception {
        ReportRequestDTO dto = new ReportRequestDTO();
        dto.setBaseReportId("rpt-001");
        dto.setName("Automated Intraday Cash Position");
        dto.setBranchCode("NYC-001");
        dto.setAccountNumbers(Arrays.asList("CITI-US-99201488"));
        dto.setCurrency("USD");
        dto.setDateFrom(LocalDate.of(2026, 5, 1));
        dto.setDateTo(LocalDate.of(2026, 5, 18));
        dto.setTransactionType("ALL");
        dto.setMinAmount(new BigDecimal("1000.00"));
        dto.setMaxAmount(new BigDecimal("50000000.00"));
        dto.setExportFormat("PDF");

        mockMvc.perform(post("/api/reports/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.reportName", is("Automated Intraday Cash Position")))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    public void testCreateSchedule() throws Exception {
        ReportScheduleDTO dto = new ReportScheduleDTO();
        dto.setCriteriaId("crit-001");
        dto.setFrequency("WEEKLY");
        dto.setCronExpression("0 0 8 ? * MON");
        dto.setExecutionTimeUtc("08:00:00");
        dto.setExportFormat("PDF");

        mockMvc.perform(post("/api/reports/schedule")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.frequency", is("WEEKLY")))
                .andExpect(jsonPath("$.status", is("PENDING_APPROVAL")));
    }

    @Test
    public void testExportReportPdf() throws Exception {
        mockMvc.perform(get("/api/reports/rpt-01/export").param("format", "PDF"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().exists("Content-Disposition"));
    }

    @Test
    public void testExportReportExcel() throws Exception {
        mockMvc.perform(get("/api/reports/rpt-01/export").param("format", "EXCEL"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @Test
    public void testExportReportCsv() throws Exception {
        mockMvc.perform(get("/api/reports/rpt-01/export").param("format", "CSV"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")));
    }
}
