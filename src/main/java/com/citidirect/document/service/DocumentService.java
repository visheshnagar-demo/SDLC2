package com.citidirect.document.service;

import com.citidirect.auth.entity.User;
import com.citidirect.document.dto.DocumentResponseDTO;
import com.citidirect.document.dto.ExtractedDataDTO;
import com.citidirect.document.entity.DocumentEntity;
import com.citidirect.document.repository.DocumentRepository;
import com.citidirect.ocr.service.OcrProcessingService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MalwareScanService malwareScanService;
    private final OcrProcessingService ocrProcessingService;

    public DocumentService(
            DocumentRepository documentRepository,
            MalwareScanService malwareScanService,
            OcrProcessingService ocrProcessingService) {
        this.documentRepository = documentRepository;
        this.malwareScanService = malwareScanService;
        this.ocrProcessingService = ocrProcessingService;
    }

    @Transactional
    public DocumentResponseDTO uploadDocument(MultipartFile file, String documentType, User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document file must be provided");
        }

        if (documentType == null || documentType.trim().isEmpty()) {
            documentType = "PASSPORT";
        }
        String normalizedDocType = documentType.trim().toUpperCase();

        // 1. Malware and MIME validation
        malwareScanService.scanFile(file);

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read uploaded document: " + e.getMessage());
        }

        String mimeType = malwareScanService.detectAndValidateMimeType(fileBytes, file.getContentType(), file.getOriginalFilename());
        String sha256Hash = computeSha256(fileBytes);
        String docId = UUID.randomUUID().toString();
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document_" + docId;
        String fileUrl = "vault://documents/" + docId + "/" + fileName;

        // 2. OCR Extraction
        OcrProcessingService.OcrResult ocrResult = ocrProcessingService.processDocument(
                fileBytes,
                fileName,
                mimeType,
                normalizedDocType
        );

        ExtractedDataDTO extractedData = ocrResult.getExtractedData();

        // 3. Entity Creation & Persistence
        DocumentEntity entity = new DocumentEntity();
        entity.setId(docId);
        entity.setUserId(currentUser.getId());
        entity.setDocumentType(normalizedDocType);
        entity.setFileName(fileName);
        entity.setFileUrl(fileUrl);
        entity.setMimeType(mimeType);
        entity.setFileSize(file.getSize());
        entity.setFileHashSha256(sha256Hash);

        if (extractedData != null) {
            entity.setExtractedFullName(extractedData.getFullName());
            entity.setExtractedDob(extractedData.getDateOfBirth());
            entity.setExtractedDocNumber(extractedData.getDocumentNumber());
            entity.setExtractedExpiryDate(extractedData.getExpiryDate());
        }

        entity.setOcrConfidenceScore(ocrResult.getConfidence());
        entity.setStatus(ocrResult.getStatus());
        entity.setWarningFlags(String.join(";", ocrResult.getWarningFlags()));
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        DocumentEntity saved = documentRepository.save(entity);

        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO getDocumentById(String id, User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }

        DocumentEntity entity = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found with ID: " + id));

        boolean isAdminOrOfficer = "ROLE_ADMIN".equals(currentUser.getRole()) || "ROLE_OFFICER".equals(currentUser.getRole());
        if (!isAdminOrOfficer && !entity.getUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you do not own this document");
        }

        return toResponseDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> getUserDocuments(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }

        List<DocumentEntity> list = documentRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public DocumentResponseDTO toResponseDTO(DocumentEntity entity) {
        ExtractedDataDTO extractedData = new ExtractedDataDTO(
                entity.getExtractedFullName(),
                entity.getExtractedDob(),
                entity.getExtractedDocNumber(),
                entity.getExtractedExpiryDate()
        );

        List<String> warnings = new ArrayList<>();
        if (entity.getWarningFlags() != null && !entity.getWarningFlags().trim().isEmpty()) {
            warnings = Arrays.stream(entity.getWarningFlags().split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return new DocumentResponseDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getDocumentType(),
                entity.getFileName(),
                entity.getFileUrl(),
                entity.getMimeType(),
                entity.getFileSize(),
                entity.getFileHashSha256(),
                extractedData,
                entity.getOcrConfidenceScore(),
                entity.getStatus(),
                warnings,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
