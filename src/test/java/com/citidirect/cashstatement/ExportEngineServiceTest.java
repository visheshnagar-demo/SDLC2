package com.citidirect.cashstatement;

import com.citidirect.cashstatement.service.ExportEngineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class ExportEngineServiceTest {

    @Autowired
    private ExportEngineService exportEngineService;

    @Test
    public void testGeneratePdfExport() {
        byte[] pdf = exportEngineService.generatePdfReport("Daily Cash Position", "ACC-100234", "USD");
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    public void testGenerateExcelExport() {
        byte[] excel = exportEngineService.generateExcelReport("Daily Cash Position", "ACC-100234", "USD");
        assertNotNull(excel);
        assertTrue(excel.length > 0);
    }

    @Test
    public void testGenerateCsvExport() {
        byte[] csv = exportEngineService.generateCsvReport("Daily Cash Position", "ACC-100234", "USD");
        assertNotNull(csv);
        assertTrue(csv.length > 0);
        String csvString = new String(csv);
        assertTrue(csvString.contains("Posting Date"));
        assertTrue(csvString.contains("ACC-100234"));
    }
}
