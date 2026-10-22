package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.DashboardMetricsResponse;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.QuoteRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardAnalyticsService {

    private final SubmissionRepository submissionRepository;
    private final QuoteRepository quoteRepository;

    public DashboardAnalyticsService(SubmissionRepository submissionRepository,
                                     QuoteRepository quoteRepository) {
        this.submissionRepository = submissionRepository;
        this.quoteRepository = quoteRepository;
    }

    public DashboardMetricsResponse getMetrics() {
        List<SubmissionEntity> all = submissionRepository.findAll();
        long totalSubmissions = all.size();

        Map<String, Long> submissionsByLine = new HashMap<>();
        Map<String, Long> submissionsByStatus = new HashMap<>();
        Map<String, BigDecimal> totalExposedLimitByLine = new HashMap<>();

        long boundCount = 0;
        long quotedCount = 0;
        long totalHours = 0;
        long pendingReferrals = 0;

        for (SubmissionEntity s : all) {
            String lob = s.getLineOfBusiness();
            String st = s.getStatus();

            submissionsByLine.put(lob, submissionsByLine.getOrDefault(lob, 0L) + 1);
            submissionsByStatus.put(st, submissionsByStatus.getOrDefault(st, 0L) + 1);

            BigDecimal currentLimit = totalExposedLimitByLine.getOrDefault(lob, BigDecimal.ZERO);
            totalExposedLimitByLine.put(lob, currentLimit.add(s.getPolicyLimit() != null ? s.getPolicyLimit() : BigDecimal.ZERO));

            if ("BOUND".equalsIgnoreCase(st)) {
                boundCount++;
            }
            if ("QUOTED".equalsIgnoreCase(st) || "BOUND".equalsIgnoreCase(st)) {
                quotedCount++;
            }
            if (s.getIsReferred() != null && s.getIsReferred()) {
                pendingReferrals++;
            }

            Instant created = s.getCreatedAt();
            Instant updated = s.getUpdatedAt();
            if (created != null && updated != null) {
                totalHours += Math.max(1, Duration.between(created, updated).toHours());
            }
        }

        BigDecimal quoteToBindRatio = BigDecimal.ZERO;
        if (quotedCount > 0) {
            quoteToBindRatio = BigDecimal.valueOf(boundCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(quotedCount), 1, RoundingMode.HALF_UP);
        }

        BigDecimal avgTurnaround = BigDecimal.ZERO;
        if (totalSubmissions > 0) {
            avgTurnaround = BigDecimal.valueOf(totalHours)
                    .divide(BigDecimal.valueOf(totalSubmissions), 1, RoundingMode.HALF_UP);
        }

        return new DashboardMetricsResponse(
                totalSubmissions,
                submissionsByLine,
                submissionsByStatus,
                quoteToBindRatio,
                avgTurnaround,
                totalExposedLimitByLine,
                pendingReferrals,
                Instant.now()
        );
    }
}
