package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateQuoteRequest;
import com.reinsurance.portal.dto.QuoteResponse;
import com.reinsurance.portal.entity.QuoteEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.QuoteRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuoteBuilderService {

    private final QuoteRepository quoteRepository;
    private final SubmissionRepository submissionRepository;
    private final AuditTrailService auditTrailService;

    public QuoteBuilderService(QuoteRepository quoteRepository,
                               SubmissionRepository submissionRepository,
                               AuditTrailService auditTrailService) {
        this.quoteRepository = quoteRepository;
        this.submissionRepository = submissionRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional
    public QuoteResponse createQuote(UUID submissionId, CreateQuoteRequest request, String userEmail, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + submissionId));

        BigDecimal sharePct = request.shareOfferedPercentage();
        BigDecimal commPct = request.cedingCommissionPercentage();
        BigDecimal grossPrem = submission.getGrossPremium();

        BigDecimal calculatedReinsurancePremium = request.calculatedReinsurancePremium();
        if (calculatedReinsurancePremium == null || calculatedReinsurancePremium.compareTo(BigDecimal.ZERO) <= 0) {
            calculatedReinsurancePremium = grossPrem.multiply(sharePct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        BigDecimal cedingCommissionAmount = calculatedReinsurancePremium.multiply(commPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netReinsurancePremium = calculatedReinsurancePremium.subtract(cedingCommissionAmount);

        QuoteEntity quote = new QuoteEntity();
        quote.setSubmission(submission);
        quote.setShareOfferedPercentage(sharePct);
        quote.setCedingCommissionPercentage(commPct);
        quote.setCalculatedReinsurancePremium(calculatedReinsurancePremium);
        quote.setSubjectivities(request.subjectivities());
        quote.setConditions(request.conditions());
        quote.setExclusions(request.exclusions());
        quote.setStatus("ISSUED");
        quote.setCreatedBy(userEmail);
        quote.setCreatedAt(Instant.now());

        QuoteEntity saved = quoteRepository.save(quote);

        // Update submission status to QUOTED if still In Review
        if ("RECEIVED".equalsIgnoreCase(submission.getStatus()) || "IN_REVIEW".equalsIgnoreCase(submission.getStatus())) {
            submission.setStatus("QUOTED");
            submissionRepository.save(submission);
        }

        auditTrailService.recordEvent(
                submission,
                "QUOTE_CREATED",
                userEmail,
                userRole,
                "Quote created: " + sharePct + "% share, " + commPct + "% commission, Net Premium $" + netReinsurancePremium,
                null,
                "ISSUED"
        );

        return new QuoteResponse(
                saved.getId(),
                submissionId,
                saved.getShareOfferedPercentage(),
                saved.getCedingCommissionPercentage(),
                saved.getCalculatedReinsurancePremium(),
                netReinsurancePremium,
                cedingCommissionAmount,
                saved.getSubjectivities(),
                saved.getConditions(),
                saved.getExclusions(),
                saved.getStatus(),
                saved.getCreatedBy(),
                saved.getCreatedAt()
        );
    }

    public List<QuoteResponse> getQuotesForSubmission(UUID submissionId) {
        return quoteRepository.findBySubmissionId(submissionId).stream()
                .map(q -> {
                    BigDecimal calculatedPremium = q.getCalculatedReinsurancePremium();
                    BigDecimal commAmount = calculatedPremium.multiply(q.getCedingCommissionPercentage()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    BigDecimal netPrem = calculatedPremium.subtract(commAmount);

                    return new QuoteResponse(
                            q.getId(),
                            submissionId,
                            q.getShareOfferedPercentage(),
                            q.getCedingCommissionPercentage(),
                            q.getCalculatedReinsurancePremium(),
                            netPrem,
                            commAmount,
                            q.getSubjectivities(),
                            q.getConditions(),
                            q.getExclusions(),
                            q.getStatus(),
                            q.getCreatedBy(),
                            q.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }
}
