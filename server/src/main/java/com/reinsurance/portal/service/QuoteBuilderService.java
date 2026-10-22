package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateQuoteRequest;
import com.reinsurance.portal.dto.QuoteResponse;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.QuoteEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.QuoteRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class QuoteBuilderService {

    private final SubmissionRepository submissionRepository;
    private final QuoteRepository quoteRepository;
    private final IntakeService intakeService;
    private final AuditTrailService auditTrailService;

    @Value("${app.underwriting.default-authority-limit:5000000.00}")
    private BigDecimal defaultAuthorityLimit;

    public QuoteBuilderService(
            SubmissionRepository submissionRepository,
            QuoteRepository quoteRepository,
            IntakeService intakeService,
            AuditTrailService auditTrailService) {
        this.submissionRepository = submissionRepository;
        this.quoteRepository = quoteRepository;
        this.intakeService = intakeService;
        this.auditTrailService = auditTrailService;
    }

    @Transactional
    public SubmissionResponse createOrUpdateQuote(UUID submissionId, CreateQuoteRequest request, String userId, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + submissionId));

        BigDecimal sharePct = request.shareOfferedPercentage();
        BigDecimal commPct = request.cedingCommissionPercentage();
        BigDecimal grossPremium = submission.getGrossPremium();

        // Calculate ceded premium: grossPremium * (shareOfferedPercentage / 100)
        BigDecimal cededPremium = grossPremium.multiply(sharePct)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Commission amount: cededPremium * (cedingCommissionPercentage / 100)
        BigDecimal commissionAmount = cededPremium.multiply(commPct)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Net Reinsurance Premium: cededPremium - commissionAmount
        BigDecimal netPremium = cededPremium.subtract(commissionAmount);

        QuoteEntity quote = quoteRepository.findBySubmissionId(submissionId)
            .orElseGet(() -> {
                QuoteEntity q = new QuoteEntity();
                q.setSubmission(submission);
                return q;
            });

        quote.setShareOfferedPercentage(sharePct);
        quote.setCedingCommissionPercentage(commPct);
        quote.setCalculatedReinsurancePremium(cededPremium);
        quote.setNetReinsurancePremium(netPremium);
        quote.setSubjectivities(request.subjectivities());
        quote.setConditions(request.conditions());
        quote.setExclusions(request.exclusions());
        quote.setStatus("ISSUED");
        quote.setCreatedBy(userId != null ? userId : "underwriter");

        quoteRepository.save(quote);
        submission.setQuote(quote);

        // Authority check
        boolean isManager = userRole != null && (userRole.contains("MANAGER") || userRole.contains("ADMIN"));
        if (submission.getPolicyLimit().compareTo(defaultAuthorityLimit) > 0 && !isManager && submission.isReferred()) {
            submission.setStatus("REFERRED_TO_MANAGER");
        } else {
            submission.setStatus("QUOTED");
        }

        SubmissionEntity saved = submissionRepository.save(submission);

        String summary = String.format("Quote created/updated: Share %.2f%%, Ceded Premium $%s, Commission %.2f%%, Net Premium $%s. Status: %s",
            sharePct, cededPremium.toPlainString(), commPct, netPremium.toPlainString(), saved.getStatus());
        auditTrailService.logAction(submissionId, "QUOTE_CREATED", userId, userRole, summary);

        return intakeService.toResponse(saved);
    }
}
