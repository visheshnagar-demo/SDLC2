package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.SubmissionRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class UnderwriterQueueService {

    private final SubmissionRepository submissionRepository;
    private final IntakeService intakeService;

    @Value("${app.underwriting.sla.green-hours:24}")
    private long greenHours;

    @Value("${app.underwriting.sla.yellow-hours:48}")
    private long yellowHours;

    public UnderwriterQueueService(SubmissionRepository submissionRepository, IntakeService intakeService) {
        this.submissionRepository = submissionRepository;
        this.intakeService = intakeService;
    }

    @Transactional(readOnly = true)
    public Page<SubmissionResponse> queryQueue(
            String status,
            String lineOfBusiness,
            String riskTier,
            Boolean isReferred,
            String searchQuery,
            String slaState,
            String userRole,
            String cedingCompany,
            Pageable pageable) {

        Specification<SubmissionEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.toUpperCase().trim()));
            }

            if (lineOfBusiness != null && !lineOfBusiness.isBlank() && !"ALL".equalsIgnoreCase(lineOfBusiness)) {
                String norm = lineOfBusiness.toUpperCase().trim().replace(" ", "_").replace("&", "AND");
                predicates.add(cb.equal(root.get("lineOfBusiness"), norm));
            }

            if (riskTier != null && !riskTier.isBlank() && !"ALL".equalsIgnoreCase(riskTier)) {
                predicates.add(cb.equal(root.get("riskTier"), riskTier.toUpperCase().trim()));
            }

            if (isReferred != null) {
                predicates.add(cb.equal(root.get("isReferred"), isReferred));
            }

            if (searchQuery != null && !searchQuery.isBlank()) {
                String pattern = "%" + searchQuery.toLowerCase().trim() + "%";
                Predicate insuredMatch = cb.like(cb.lower(root.get("insuredName")), pattern);
                Predicate cedentMatch = cb.like(cb.lower(root.get("cedingCompanyName")), pattern);
                predicates.add(cb.or(insuredMatch, cedentMatch));
            }

            // Role based filtering for ceding company users
            if ("ROLE_CEDANT".equalsIgnoreCase(userRole) && cedingCompany != null && !cedingCompany.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("cedingCompanyName")), cedingCompany.toLowerCase().trim()));
            }

            // SLA State filtering
            if (slaState != null && !slaState.isBlank() && !"ALL".equalsIgnoreCase(slaState)) {
                Instant now = Instant.now();
                if ("GREEN".equalsIgnoreCase(slaState)) {
                    Instant cutoff = now.minus(greenHours, ChronoUnit.HOURS);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), cutoff));
                } else if ("YELLOW".equalsIgnoreCase(slaState)) {
                    Instant cutoffGreen = now.minus(greenHours, ChronoUnit.HOURS);
                    Instant cutoffYellow = now.minus(yellowHours, ChronoUnit.HOURS);
                    predicates.add(cb.lessThan(root.get("createdAt"), cutoffGreen));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), cutoffYellow));
                } else if ("RED".equalsIgnoreCase(slaState)) {
                    Instant cutoffYellow = now.minus(yellowHours, ChronoUnit.HOURS);
                    predicates.add(cb.lessThan(root.get("createdAt"), cutoffYellow));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SubmissionEntity> page = submissionRepository.findAll(spec, pageable);
        List<SubmissionResponse> responses = page.getContent().stream()
            .map(intakeService::toResponse)
            .toList();

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }
}
