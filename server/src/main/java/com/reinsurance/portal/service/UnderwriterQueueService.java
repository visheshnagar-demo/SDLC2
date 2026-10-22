package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.RiskScoreResponse;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.RiskFactorBreakdownEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.RiskFactorBreakdownRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UnderwriterQueueService {

    private final SubmissionRepository submissionRepository;
    private final RiskFactorBreakdownRepository factorBreakdownRepository;
    private final IntakeService intakeService;

    public UnderwriterQueueService(SubmissionRepository submissionRepository,
                                   RiskFactorBreakdownRepository factorBreakdownRepository,
                                   IntakeService intakeService) {
        this.submissionRepository = submissionRepository;
        this.factorBreakdownRepository = factorBreakdownRepository;
        this.intakeService = intakeService;
    }

    public Page<SubmissionResponse> getSubmissions(String status, String lineOfBusiness, String riskTier,
                                                   String cedingCompany, String currentUserEmail,
                                                   String currentUserRole, Pageable pageable) {

        Specification<SubmissionEntity> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if ("ROLE_CEDANT".equalsIgnoreCase(currentUserRole) && currentUserEmail != null) {
                predicates.add(cb.equal(root.get("createdBy"), currentUserEmail));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (lineOfBusiness != null && !lineOfBusiness.isBlank() && !"ALL".equalsIgnoreCase(lineOfBusiness)) {
                predicates.add(cb.equal(root.get("lineOfBusiness"), lineOfBusiness));
            }

            if (riskTier != null && !riskTier.isBlank() && !"ALL".equalsIgnoreCase(riskTier)) {
                predicates.add(cb.equal(root.get("riskTier"), riskTier));
            }

            if (cedingCompany != null && !cedingCompany.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("cedingCompanyName")), "%" + cedingCompany.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<SubmissionEntity> page = submissionRepository.findAll(spec, pageable);

        List<SubmissionResponse> responses = page.getContent().stream()
                .map(this::getSubmissionDetail)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    public SubmissionResponse getSubmissionDetail(SubmissionEntity submission) {
        List<RiskScoreResponse.FactorScoreItem> factors = factorBreakdownRepository.findBySubmissionId(submission.getId())
                .stream()
                .map(f -> new RiskScoreResponse.FactorScoreItem(
                        f.getFactorCategory(),
                        f.getFactorName(),
                        f.getScoreAwarded(),
                        f.getMaxScore(),
                        f.getEvaluationNotes()
                ))
                .collect(Collectors.toList());

        return intakeService.mapToResponse(submission, factors);
    }

    public SubmissionResponse getSubmissionById(UUID id, String currentUserEmail, String currentUserRole) {
        SubmissionEntity entity = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + id));

        if ("ROLE_CEDANT".equalsIgnoreCase(currentUserRole) && currentUserEmail != null) {
            if (!currentUserEmail.equalsIgnoreCase(entity.getCreatedBy())) {
                throw new SecurityException("Unauthorized access to submission");
            }
        }

        return getSubmissionDetail(entity);
    }
}
