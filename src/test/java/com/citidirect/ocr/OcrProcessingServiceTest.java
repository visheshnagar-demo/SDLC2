package com.citidirect.ocr;

import com.citidirect.ocr.service.OcrProcessingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OcrProcessingServiceTest {

    private OcrProcessingService ocrService;

    @BeforeEach
    void setUp() {
        ocrService = new OcrProcessingService();
    }

    @Test
    void testExtractDataFromTextPayload() {
        String documentText = "USA PASSPORT\n" +
                "Full Name: JOHN ALEXANDER DOE\n" +
                "Date of Birth: 1988-08-24\n" +
                "Passport No: P98765432\n" +
                "Expiry Date: 2030-05-18\n";

        byte[] bytes = documentText.getBytes(StandardCharsets.UTF_8);
        OcrProcessingService.OcrResult result = ocrService.processDocument(bytes, "passport.jpg", "image/jpeg", "PASSPORT");

        assertNotNull(result);
        assertEquals("PROCESSED", result.getStatus());
        assertTrue(result.getConfidence() >= 0.90);
        assertNotNull(result.getExtractedData());
        assertEquals("JOHN ALEXANDER DOE", result.getExtractedData().getFullName());
        assertEquals(LocalDate.of(1988, 8, 24), result.getExtractedData().getDateOfBirth());
        assertEquals("P98765432", result.getExtractedData().getDocumentNumber());
        assertEquals(LocalDate.of(2030, 5, 18), result.getExtractedData().getExpiryDate());
    }

    @Test
    void testExtractDataFromMrzPayload() {
        String mrz = "P<USAJOHN<<DOE<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n" +
                "P123456780USA9005156F2811204<<<<<<<<<<<<<<02\n";

        byte[] bytes = mrz.getBytes(StandardCharsets.UTF_8);
        OcrProcessingService.OcrResult result = ocrService.processDocument(bytes, "passport.png", "image/png", "PASSPORT");

        assertNotNull(result);
        assertEquals("PROCESSED", result.getStatus());
        assertNotNull(result.getExtractedData());
        assertEquals("JOHN DOE", result.getExtractedData().getFullName());
        assertEquals("P12345678", result.getExtractedData().getDocumentNumber());
        assertEquals(LocalDate.of(1990, 5, 15), result.getExtractedData().getDateOfBirth());
        assertEquals(LocalDate.of(2028, 11, 20), result.getExtractedData().getExpiryDate());
    }

    @Test
    void testExpiryWarningWithin30Days() {
        List<String> warnings = new ArrayList<>();
        LocalDate soonExpiring = LocalDate.now().plusDays(20);

        ocrService.evaluateExpiryRules(soonExpiring, warnings);

        assertFalse(warnings.isEmpty());
        assertTrue(warnings.get(0).contains("expires in 20 days"));
    }

    @Test
    void testExpiredDocumentWarning() {
        List<String> warnings = new ArrayList<>();
        LocalDate expired = LocalDate.now().minusDays(5);

        ocrService.evaluateExpiryRules(expired, warnings);

        assertFalse(warnings.isEmpty());
        assertTrue(warnings.get(0).contains("expired"));
    }

    @Test
    void testParseDateFormats() {
        assertEquals(LocalDate.of(2025, 12, 31), ocrService.parseDate("2025-12-31"));
        assertEquals(LocalDate.of(2025, 12, 31), ocrService.parseDate("12/31/2025"));
        assertEquals(LocalDate.of(2025, 12, 31), ocrService.parseDate("31/12/2025"));
        assertEquals(LocalDate.of(2025, 12, 31), ocrService.parseDate("31 Dec 2025"));
    }
}
