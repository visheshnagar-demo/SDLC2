package com.genre.qtb.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.genre.qtb.model.PolicyBinderEntity;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.model.RiskExposureEntity;
import com.genre.qtb.repository.InMemoryMockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class SyntheticDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SyntheticDataInitializer.class);

    private final InMemoryMockRepository repository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    public SyntheticDataInitializer(InMemoryMockRepository repository, ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(ApplicationArguments args) {
        loadQuotes();
        loadRisks();
        loadBinders();
        log.info("Synthetic data initialization complete. Loaded {} quotes, {} risks, {} binders.",
                repository.getQuotesCount(), repository.getRisksCount(), repository.getBindersCount());
    }

    private void loadQuotes() {
        try {
            Resource resource = resourceLoader.getResource("classpath:data/synthetic-quotes.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<QuoteEntity> quoteList = objectMapper.readValue(is, new TypeReference<List<QuoteEntity>>() {});
                    quoteList.forEach(repository::saveQuote);
                    log.info("Successfully loaded {} synthetic quotes", quoteList.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to load synthetic quotes: {}", e.getMessage(), e);
        }
    }

    private void loadRisks() {
        try {
            Resource resource = resourceLoader.getResource("classpath:data/synthetic-risks.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<RiskExposureEntity> riskList = objectMapper.readValue(is, new TypeReference<List<RiskExposureEntity>>() {});
                    riskList.forEach(repository::saveRisk);
                    log.info("Successfully loaded {} synthetic risks", riskList.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to load synthetic risks: {}", e.getMessage(), e);
        }
    }

    private void loadBinders() {
        try {
            Resource resource = resourceLoader.getResource("classpath:data/synthetic-binders.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<PolicyBinderEntity> binderList = objectMapper.readValue(is, new TypeReference<List<PolicyBinderEntity>>() {});
                    binderList.forEach(repository::saveBinder);
                    log.info("Successfully loaded {} synthetic binders", binderList.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to load synthetic binders: {}", e.getMessage(), e);
        }
    }
}
