package com.citidirect.cashstatement.scheduling;

import com.citidirect.cashstatement.criteria.model.DerivedReport;
import com.citidirect.cashstatement.criteria.repository.DerivedReportRepository;
import com.citidirect.cashstatement.delivery.dto.AuthorizationRequest;
import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.scheduling.dto.ScheduleRequest;
import com.citidirect.cashstatement.scheduling.dto.ScheduleResponse;
import com.citidirect.cashstatement.scheduling.model.ReportSchedule;
import com.citidirect.cashstatement.scheduling.model.ScheduleHistory;
import com.citidirect.cashstatement.scheduling.repository.ReportScheduleRepository;
import com.citidirect.cashstatement.scheduling.repository.ScheduleHistoryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportScheduleService {

    private final ReportScheduleRepository scheduleRepository;
    private final ScheduleHistoryRepository historyRepository;
    private final DerivedReportRepository derivedReportRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final AppUserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ReportScheduleService(ReportScheduleRepository scheduleRepository,
                                 ScheduleHistoryRepository historyRepository,
                                 DerivedReportRepository derivedReportRepository,
                                 DeliveryOptionRepository deliveryOptionRepository,
                                 AppUserRepository userRepository,
                                 ObjectMapper objectMapper) {
        this.scheduleRepository = scheduleRepository;
        this.historyRepository = historyRepository;
        this.derivedReportRepository = derivedReportRepository;
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request, String makerUserId) {
        // Resolve Derived Report
        String derivedReportId = request.getDerivedReportId();
        if (derivedReportId == null || derivedReportId.isEmpty()) {
            DerivedReport dr = derivedReportRepository.findByDerivedReportName(request.getEventName())
                    .orElseThrow(() -> new IllegalArgumentException("Derived Report with name '" + request.getEventName() + "' must be saved first before scheduling"));
            derivedReportId = dr.getId();
        }

        // Verify Delivery Option exists and is authorized (or pending)
        DeliveryOption delOpt = deliveryOptionRepository.findById(request.getDeliveryOptionId())
                .orElseThrow(() -> new IllegalArgumentException("Delivery Option not found: " + request.getDeliveryOptionId()));

        ReportSchedule schedule = new ReportSchedule();
        schedule.setId(UUID.randomUUID().toString());
        schedule.setScheduleReferenceId("SCH-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        schedule.setScheduleName(request.getScheduleName());
        schedule.setEventType("Report");
        schedule.setEventName(request.getEventName());
        schedule.setDerivedReportId(derivedReportId);
        schedule.setDeliveryOptionId(delOpt.getId());
        schedule.setIntervalType(request.getIntervalType());
        schedule.setHolidayOption(request.getHolidayOption() != null ? request.getHolidayOption() : "RUN_ALL_DAYS");
        schedule.setRunTimeUser(request.getRunTimeUser());
        schedule.setAuthStatus("PENDING_AUTHORIZATION");
        schedule.setMakerId(makerUserId);
        schedule.setCreatedAt(OffsetDateTime.now());
        schedule.setUpdatedAt(OffsetDateTime.now());

        try {
            schedule.setIntervalConfig(objectMapper.writeValueAsString(request.getIntervalConfig() != null ? request.getIntervalConfig() : Map.of()));
        } catch (Exception e) {
            schedule.setIntervalConfig("{}");
        }

        ReportSchedule saved = scheduleRepository.save(schedule);
        return mapToResponse(saved);
    }

    @Transactional
    public ScheduleResponse authorizeSchedule(String id, AuthorizationRequest authRequest, String checkerUserId) {
        ReportSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + id));

        // Segregation of Duties (SOD): checker cannot be maker
        if (schedule.getMakerId().equalsIgnoreCase(checkerUserId)) {
            throw new IllegalStateException("Segregation of duties violation: maker cannot authorize their own schedule");
        }

        String action = authRequest.getAction().toUpperCase();
        switch (action) {
            case "AUTHORIZE":
                schedule.setAuthStatus("AUTHORIZED");
                schedule.setRejectionReason(null);
                break;
            case "REJECT":
                schedule.setAuthStatus("REJECTED");
                schedule.setRejectionReason(authRequest.getComment());
                break;
            case "SEND_TO_REPAIR":
                schedule.setAuthStatus("REPAIR_REQUIRED");
                schedule.setRejectionReason(authRequest.getComment());
                break;
            default:
                throw new IllegalArgumentException("Invalid authorization action: " + action);
        }

        schedule.setCheckerId(checkerUserId);
        schedule.setUpdatedAt(OffsetDateTime.now());
        ReportSchedule saved = scheduleRepository.save(schedule);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> listSchedules(String authStatus) {
        List<ReportSchedule> list;
        if (authStatus != null && !authStatus.isEmpty() && !"ALL".equalsIgnoreCase(authStatus)) {
            list = scheduleRepository.findByAuthStatus(authStatus);
        } else {
            list = scheduleRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(String id) {
        ReportSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + id));
        return mapToResponse(schedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleHistory> getScheduleHistory(String scheduleId) {
        return historyRepository.findByScheduleIdOrderByExecutionTimeGmtDesc(scheduleId);
    }

    @Transactional
    public void deleteSchedule(String id) {
        scheduleRepository.deleteById(id);
    }

    public ScheduleResponse mapToResponse(ReportSchedule entity) {
        ScheduleResponse resp = new ScheduleResponse();
        resp.setId(entity.getId());
        resp.setScheduleReferenceId(entity.getScheduleReferenceId());
        resp.setScheduleName(entity.getScheduleName());
        resp.setEventType(entity.getEventType());
        resp.setEventName(entity.getEventName());
        resp.setDerivedReportId(entity.getDerivedReportId());
        resp.setDeliveryOptionId(entity.getDeliveryOptionId());
        resp.setIntervalType(entity.getIntervalType());
        resp.setHolidayOption(entity.getHolidayOption());
        resp.setRunTimeUser(entity.getRunTimeUser());
        resp.setAuthStatus(entity.getAuthStatus());
        resp.setMakerId(entity.getMakerId());
        resp.setCheckerId(entity.getCheckerId());
        resp.setRejectionReason(entity.getRejectionReason());
        resp.setCreatedAt(entity.getCreatedAt());
        resp.setUpdatedAt(entity.getUpdatedAt());

        deliveryOptionRepository.findById(entity.getDeliveryOptionId())
                .ifPresent(d -> resp.setDeliveryOptionName(d.getName()));

        if (entity.getMakerId() != null) {
            userRepository.findById(entity.getMakerId()).ifPresent(u -> resp.setMakerUsername(u.getUsername()));
        }
        if (entity.getCheckerId() != null) {
            userRepository.findById(entity.getCheckerId()).ifPresent(u -> resp.setCheckerUsername(u.getUsername()));
        }

        try {
            Map<String, Object> map = objectMapper.readValue(entity.getIntervalConfig(), new TypeReference<>() {});
            resp.setIntervalConfig(map);
        } catch (Exception e) {
            resp.setIntervalConfig(Map.of());
        }

        return resp;
    }
}
