package com.identiverify.controller;

import com.identiverify.dto.DocumentUploadRequest;
import com.identiverify.dto.DocumentUploadResponse;
import com.identiverify.service.DocumentOcrService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentOcrService documentOcrService;

    public DocumentController(DocumentOcrService documentOcrService) {
        this.documentOcrService = documentOcrService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(@Valid @RequestBody DocumentUploadRequest request) {
        DocumentUploadResponse response = documentOcrService.processDocumentUpload(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verification/{verificationId}")
    public ResponseEntity<List<DocumentUploadResponse>> getDocumentsByVerification(@PathVariable("verificationId") UUID verificationId) {
        List<DocumentUploadResponse> responses = documentOcrService.getDocumentsByVerificationId(verificationId);
        return ResponseEntity.ok(responses);
    }
}
