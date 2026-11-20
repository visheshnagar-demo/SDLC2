package com.citidirect.document;

import com.citidirect.auth.AuthApplication;
import com.citidirect.auth.dto.RegisterRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AuthApplication.class)
@AutoConfigureMockMvc
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private String userEmail;

    @BeforeEach
    void setUp() throws Exception {
        userEmail = "doc_user_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        RegisterRequest regReq = new RegisterRequest(userEmail, "Password123!", "Doc User");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(body);
        userToken = jsonNode.get("access_token").asText();
    }

    private byte[] createPngBytes(String textPayload) {
        byte[] magic = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        byte[] payload = textPayload.getBytes(StandardCharsets.UTF_8);
        byte[] combined = new byte[magic.length + payload.length];
        System.arraycopy(magic, 0, combined, 0, magic.length);
        System.arraycopy(payload, 0, combined, magic.length, payload.length);
        return combined;
    }

    private byte[] createJpegBytes(String textPayload) {
        byte[] magic = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        byte[] payload = textPayload.getBytes(StandardCharsets.UTF_8);
        byte[] combined = new byte[magic.length + payload.length];
        System.arraycopy(magic, 0, combined, 0, magic.length);
        System.arraycopy(payload, 0, combined, magic.length, payload.length);
        return combined;
    }

    private byte[] createPdfBytes(String textPayload) {
        byte[] magic = "%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII);
        byte[] payload = textPayload.getBytes(StandardCharsets.UTF_8);
        byte[] combined = new byte[magic.length + payload.length];
        System.arraycopy(magic, 0, combined, 0, magic.length);
        System.arraycopy(payload, 0, combined, magic.length, payload.length);
        return combined;
    }

    @Test
    void testUploadPngPassportSuccess() throws Exception {
        String text = "PASSPORT\nName: JANE DOE\nDOB: 1990-05-15\nDoc No: P12345678\nExp: 2028-11-20\n";
        byte[] pngContent = createPngBytes(text);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "passport_front.png",
                "image/png",
                pngContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.documentType").value("PASSPORT"))
                .andExpect(jsonPath("$.fileName").value("passport_front.png"))
                .andExpect(jsonPath("$.mimeType").value("image/png"))
                .andExpect(jsonPath("$.status").value("PROCESSED"))
                .andExpect(jsonPath("$.ocrConfidence").isNumber())
                .andExpect(jsonPath("$.extractedData.fullName").value("JANE DOE"))
                .andExpect(jsonPath("$.extractedData.documentNumber").value("P12345678"));
    }

    @Test
    void testUploadJpegDriversLicenseSuccess() throws Exception {
        String text = "DRIVER LICENSE\nName: ROBERT SMITH\nDOB: 1985-03-20\nDL No: DL98765432\nExp: 2029-07-15\n";
        byte[] jpegContent = createJpegBytes(text);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "dl_front.jpg",
                "image/jpeg",
                jpegContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "DRIVERS_LICENSE")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.documentType").value("DRIVERS_LICENSE"))
                .andExpect(jsonPath("$.extractedData.fullName").value("ROBERT SMITH"))
                .andExpect(jsonPath("$.extractedData.documentNumber").value("DL98765432"));
    }

    @Test
    void testUploadPdfSuccess() throws Exception {
        byte[] pdfContent = createPdfBytes("Identity Document Details\nName: ALICE WONDER\nDoc #: ID998877\n");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "national_id.pdf",
                "application/pdf",
                pdfContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "NATIONAL_ID")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.documentType").value("NATIONAL_ID"))
                .andExpect(jsonPath("$.mimeType").value("application/pdf"));
    }

    @Test
    void testUploadExpiringDocumentGeneratesWarning() throws Exception {
        String text = "PASSPORT\nName: SAM EXPIRING\nDOB: 1992-01-01\nDoc No: P44556677\nExp: " + java.time.LocalDate.now().plusDays(15) + "\n";
        byte[] pngContent = createPngBytes(text);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "passport_expiring.png",
                "image/png",
                pngContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.warningFlags").isArray())
                .andExpect(jsonPath("$.warningFlags[0]").isNotEmpty());
    }

    @Test
    void testUploadMalwarePayloadRejected() throws Exception {
        String eicar = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
        byte[] pngContent = createPngBytes(eicar);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "infected_file.png",
                "image/png",
                pngContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUploadInvalidMimeTypeRejected() throws Exception {
        byte[] invalidBytes = "This is a plain text file without valid PNG/JPEG/PDF header".getBytes(StandardCharsets.UTF_8);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.txt",
                "text/plain",
                invalidBytes
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUploadUnauthorized() throws Exception {
        byte[] pngContent = createPngBytes("Passport test");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "passport.png",
                "image/png",
                pngContent
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetDocumentByIdAndListMyDocuments() throws Exception {
        byte[] pngContent = createPngBytes("Name: JANE DOE\nDoc No: P11223344\n");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "my_passport.png",
                "image/png",
                pngContent
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andReturn();

        String body = uploadResult.getResponse().getContentAsString();
        String docId = objectMapper.readTree(body).get("id").asText();

        // 1. Get by ID
        mockMvc.perform(get("/api/v1/documents/" + docId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(docId))
                .andExpect(jsonPath("$.fileName").value("my_passport.png"));

        // 2. Get /me
        mockMvc.perform(get("/api/v1/documents/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(docId));
    }

    @Test
    void testGetDocumentForbiddenForOtherUser() throws Exception {
        // User A uploads
        byte[] pngContent = createPngBytes("Name: USER A\nDoc No: P11111111\n");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "user_a_doc.png",
                "image/png",
                pngContent
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("documentType", "PASSPORT")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andReturn();

        String docId = objectMapper.readTree(uploadResult.getResponse().getContentAsString()).get("id").asText();

        // Register User B
        String userBEmail = "user_b_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        RegisterRequest regB = new RegisterRequest(userBEmail, "Password123!", "User B");
        MvcResult regBResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isCreated())
                .andReturn();

        String tokenB = objectMapper.readTree(regBResult.getResponse().getContentAsString()).get("access_token").asText();

        // User B attempts to access User A's document
        mockMvc.perform(get("/api/v1/documents/" + docId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());
    }
}
