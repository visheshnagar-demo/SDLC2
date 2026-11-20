package com.citidirect.document.controller;

import com.citidirect.auth.entity.User;
import com.citidirect.document.dto.DocumentResponseDTO;
import com.citidirect.document.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponseDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "PASSPORT", required = false) String documentType,
            @AuthenticationPrincipal User currentUser) {
        DocumentResponseDTO response = documentService.uploadDocument(file, documentType, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> getDocumentById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        DocumentResponseDTO response = documentService.getDocumentById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<DocumentResponseDTO>> getMyDocuments(
            @AuthenticationPrincipal User currentUser) {
        List<DocumentResponseDTO> response = documentService.getUserDocuments(currentUser);
        return ResponseEntity.ok(response);
    }
}
