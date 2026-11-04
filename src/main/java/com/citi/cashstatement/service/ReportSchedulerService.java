package com.citi.cashstatement.service;

import com.citi.cashstatement.dto.ScheduleDTO;
import com.citi.cashstatement.entity.ReportSchedule;
import com.citi.cashstatement.repository.ReportScheduleRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportSchedulerService {

    private final ReportScheduleRepository reportScheduleRepository;
    private final MakerCheckerService makerCheckerService;
    private final AuditLoggerService auditLoggerService;
    private final ObjectMapper objectMapper;

    public ReportSchedulerService(ReportScheduleRepository reportScheduleRepository,
                                  MakerCheckerService makerCheckerService,
                                  AuditLoggerService auditLoggerService,
                                  ObjectMapper objectMapper) {
        this.reportScheduleRepository = reportScheduleRepository;
        this.makerCheckerService = makerCheckerService;
        this.auditLoggerService = auditLoggerService;
        this.objectMapper = objectMapper;
    }

    public List<ScheduleDTO> getAllSchedules() {
        return reportScheduleRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ScheduleDTO getScheduleById(String id) {
        ReportSchedule schedule = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
        return mapToDTO(schedule);
    }

    @Transactional
    public ScheduleDTO createSchedule(ScheduleDTO dto, String makerId) {
        ReportSchedule schedule = new ReportSchedule();
        schedule.setId(UUID.randomUUID().toString());
        schedule.setScheduleName(dto.getScheduleName());
        schedule.setTemplateId(dto.getTemplateId() != null ? dto.getTemplateId() : "TMPL_CASH_EOD");
        schedule.setFrequency(dto.getFrequency() != null ? dto.getFrequency() : "DAILY");
        schedule.setCronExpression(dto.getCronExpression() != null ? dto.getCronExpression() : "0 0 6 ? * *");
        schedule.setExportFormat(dto.getExportFormat() != null ? dto.getExportFormat() : "CSV");
        schedule.setStatus("PENDING_APPROVAL");
        schedule.setCreatedBy(makerId != null ? makerId : "usr_maker_101");
        schedule.setCreatedAt(OffsetDateTime.now());
        schedule.setUpdatedAt(OffsetDateTime.now());

        try {
            schedule.setCriteriaJson(objectMapper.writeValueAsString(dto.getCriteria() != null ? dto.getCriteria() : Collections.emptyMap()));
            schedule.setDeliveryConfig(objectMapper.writeValueAsString(dto.getDeliveryOptions() != null ? dto.getDeliveryOptions() : Collections.emptyMap()));
        } catch (Exception e) {
            schedule.setCriteriaJson("{}");
            schedule.setDeliveryConfig("{}");
        }

        ReportSchedule saved = reportScheduleRepository.save(schedule);

        // Submit to Maker-Checker queue automatically
        makerCheckerService.submitRequest("REPORT_SCHEDULE", saved.getId(), schedule.getCreatedBy(), "New schedule creation: " + saved.getScheduleName());

        auditLoggerService.logEvent(
                schedule.getCreatedBy(),
                "CREATE_SCHEDULE",
                saved.getId(),
                "127.0.0.1",
                "CitiDirect/1.0",
                saved
        );

        return mapToDTO(saved);
    }

    @Transactional
    public ScheduleDTO updateSchedule(String id, ScheduleDTO dto, String makerId) {
        ReportSchedule schedule = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        schedule.setScheduleName(dto.getScheduleName());
        if (dto.getTemplateId() != null) schedule.setTemplateId(dto.getTemplateId());
        if (dto.getFrequency() != null) schedule.setFrequency(dto.getFrequency());
        if (dto.getCronExpression() != null) schedule.setCronExpression(dto.getCronExpression());
        if (dto.getExportFormat() != null) schedule.setExportFormat(dto.getExportFormat());
        schedule.setStatus("PENDING_APPROVAL");
        schedule.setUpdatedAt(OffsetDateTime.now());

        try {
            if (dto.getCriteria() != null) {
                schedule.setCriteriaJson(objectMapper.writeValueAsString(dto.getCriteria()));
            }
            if (dto.getDeliveryOptions() != null) {
                schedule.setDeliveryConfig(objectMapper.writeValueAsString(dto.getDeliveryOptions()));
            }
        } catch (Exception e) {
            // keep existing
        }

        ReportSchedule saved = reportScheduleRepository.save(schedule);

        makerCheckerService.submitRequest("REPORT_SCHEDULE", saved.getId(), makerId != null ? makerId : "usr_maker_101", "Schedule modification: " + saved.getScheduleName());

        auditLoggerService.logEvent(
                makerId,
                "UPDATE_SCHEDULE",
                saved.getId(),
                "127.0.0.1",
                "CitiDirect/1.0",
                saved
        );

        return mapToDTO(saved);
    }

    @Transactional
    public void deleteSchedule(String id, String userId) {
        ReportSchedule schedule = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        schedule.setStatus("INACTIVE");
        schedule.setUpdatedAt(OffsetDateTime.now());
        reportScheduleRepository.save(schedule);

        auditLoggerService.logEvent(
                userId,
                "DEACTIVATE_SCHEDULE",
                id,
                "127.0.0.1",
                "CitiDirect/1.0",
                schedule
        );
    }

    private ScheduleDTO mapToDTO(ReportSchedule schedule) {
        Map<String, Object> criteriaMap = Collections.emptyMap();
        Map<String, Object> deliveryMap = Collections.emptyMap();
        try {
            criteriaMap = objectMapper.readValue(schedule.getCriteriaJson(), new TypeReference<Map<String, Object>>() {});
            deliveryMap = objectMapper.readValue(schedule.getDeliveryConfig(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
        }

        return ScheduleDTO.builder()
                .id(schedule.getId())
                .scheduleName(schedule.getScheduleName())
                .templateId(schedule.getTemplateId())
                .criteria(criteriaMap)
                .frequency(schedule.getFrequency())
                .cronExpression(schedule.getCronExpression())
                .exportFormat(schedule.getExportFormat())
                .deliveryOptions(deliveryMap)
                .status(schedule.getStatus())
                .createdBy(schedule.getCreatedBy())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
