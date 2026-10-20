package com.genre.qtb.controller;

import com.genre.qtb.repository.InMemoryMockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final InMemoryMockRepository repository;

    public HealthController(InMemoryMockRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "genre-qtb-backend");
        health.put("timestamp", Instant.now().toString());

        Map<String, Integer> datasetStats = new LinkedHashMap<>();
        datasetStats.put("quotes", repository.getQuotesCount());
        datasetStats.put("risks", repository.getRisksCount());
        datasetStats.put("binders", repository.getBindersCount());
        health.put("datasets", datasetStats);

        return ResponseEntity.ok(health);
    }
}
