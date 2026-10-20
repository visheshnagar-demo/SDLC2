package com.genre.qtb.controller;

import com.genre.qtb.dto.BinderRequest;
import com.genre.qtb.dto.BinderResponse;
import com.genre.qtb.service.BinderWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/binders")
public class BinderController {

    private final BinderWorkflowService binderService;

    public BinderController(BinderWorkflowService binderService) {
        this.binderService = binderService;
    }

    @GetMapping
    public ResponseEntity<List<BinderResponse>> getAllBinders() {
        List<BinderResponse> binders = binderService.getAllBinders();
        return ResponseEntity.ok(binders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BinderResponse> getBinderById(@PathVariable UUID id) {
        BinderResponse binder = binderService.getBinderById(id);
        return ResponseEntity.ok(binder);
    }

    @PostMapping
    public ResponseEntity<BinderResponse> createBinder(@Valid @RequestBody BinderRequest request) {
        BinderResponse binder = binderService.createBinder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(binder);
    }
}
