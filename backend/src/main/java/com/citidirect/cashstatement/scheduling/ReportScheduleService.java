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
import org.quartz.*;
import org.quartz.impl.calendar.HolidayCalendar;
import org.quartz.impl.calendar.WeeklyCalendar;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
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

    @Autowired(required = false)
    private Scheduler scheduler;

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

        // Verify Delivery Option exists
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
                try {
                    registerQuartzJob(schedule);
                } catch (Exception ex) {
                    throw new IllegalStateException("Failed to register Quartz recurring trigger: " + ex.getMessage(), ex);
                }
                break;
            case "REJECT":
                schedule.setAuthStatus("REJECTED");
                schedule.setRejectionReason(authRequest.getComment());
                removeQuartzJob(schedule.getId());
                break;
            case "SEND_TO_REPAIR":
                schedule.setAuthStatus("REPAIR_REQUIRED");
                schedule.setRejectionReason(authRequest.getComment());
                removeQuartzJob(schedule.getId());
                break;
            default:
                throw new IllegalArgumentException("Invalid authorization action: " + action);
        }

        schedule.setCheckerId(checkerUserId);
        schedule.setUpdatedAt(OffsetDateTime.now());
        ReportSchedule saved = scheduleRepository.save(schedule);
        return mapToResponse(saved);
    }

    public static final String HOLIDAY_CALENDAR_NAME = "citiHolidayCalendar";

    public synchronized void ensureHolidayCalendarRegistered() throws SchedulerException {
        if (scheduler == null) return;
        if (scheduler.getCalendar(HOLIDAY_CALENDAR_NAME) == null) {
            WeeklyCalendar weekly = new WeeklyCalendar();
            weekly.setDayExcluded(java.util.Calendar.SATURDAY, true);
            weekly.setDayExcluded(java.util.Calendar.SUNDAY, true);
            HolidayCalendar holidayCalendar = new HolidayCalendar(weekly);
            scheduler.addCalendar(HOLIDAY_CALENDAR_NAME, holidayCalendar, true, true);
        }
    }

    public void registerQuartzJob(ReportSchedule schedule) throws SchedulerException {
        if (scheduler == null) {
            return;
        }

        JobKey jobKey = JobKey.jobKey(schedule.getId(), "REPORT_SCHEDULES");
        if (scheduler.checkExists(jobKey)) {
            scheduler.deleteJob(jobKey);
        }

        JobDetail jobDetail = JobBuilder.newJob(QuartzReportJob.class)
                .withIdentity(jobKey)
                .usingJobData("scheduleId", schedule.getId())
                .storeDurably()
                .build();

        Trigger trigger = buildTrigger(schedule, jobDetail);
        scheduler.scheduleJob(jobDetail, trigger);
    }

    private Map<String, Object> parseIntervalConfig(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private Trigger buildTrigger(ReportSchedule schedule, JobDetail jobDetail) throws SchedulerException {
        TriggerKey triggerKey = TriggerKey.triggerKey(schedule.getId(), "REPORT_SCHEDULES");
        Map<String, Object> config = parseIntervalConfig(schedule.getIntervalConfig());

        String intervalType = schedule.getIntervalType() != null ? schedule.getIntervalType().toUpperCase() : "DAILY";
        boolean isIntraDay = "INTRADAY".equalsIgnoreCase(intervalType) || Boolean.TRUE.equals(config.get("isDailyIntraDay"));

        // Parse Start Time
        int startHour = 2;
        int startMinute = 0;
        if (config.containsKey("startTime") && config.get("startTime") != null) {
            String[] parts = config.get("startTime").toString().split(":");
            if (parts.length >= 2) {
                try {
                    startHour = Integer.parseInt(parts[0].trim());
                    startMinute = Integer.parseInt(parts[1].trim());
                } catch (NumberFormatException ignored) {}
            }
        } else if (config.containsKey("hourGmt") && config.get("hourGmt") != null) {
            try {
                startHour = Integer.parseInt(config.get("hourGmt").toString().trim());
            } catch (NumberFormatException ignored) {}
        }

        // Parse Start Date
        LocalDate startDate = LocalDate.now();
        if (config.containsKey("startDate") && config.get("startDate") != null) {
            try {
                startDate = LocalDate.parse(config.get("startDate").toString().trim());
            } catch (Exception ignored) {}
        }

        int everyDays = 1;
        if (config.containsKey("everyDays") && config.get("everyDays") != null) {
            try {
                everyDays = Integer.parseInt(config.get("everyDays").toString().trim());
            } catch (NumberFormatException ignored) {}
        }

        TriggerBuilder<Trigger> builder = TriggerBuilder.newTrigger()
                .withIdentity(triggerKey)
                .forJob(jobDetail);

        if (isIntraDay) {
            int endHour = 17;
            int endMinute = 30;
            if (config.containsKey("intraDayEndTime") && config.get("intraDayEndTime") != null) {
                String[] parts = config.get("intraDayEndTime").toString().split(":");
                if (parts.length >= 2) {
                    try {
                        endHour = Integer.parseInt(parts[0].trim());
                        endMinute = Integer.parseInt(parts[1].trim());
                    } catch (NumberFormatException ignored) {}
                }
            }

            int intervalMinutes = 30;
            if (config.containsKey("intraDayInterval") && config.get("intraDayInterval") != null) {
                String val = config.get("intraDayInterval").toString().trim();
                if (val.contains(":")) {
                    String[] parts = val.split(":");
                    try {
                        int h = Integer.parseInt(parts[0].trim());
                        int m = Integer.parseInt(parts[1].trim());
                        intervalMinutes = (h * 60) + m;
                    } catch (NumberFormatException ignored) {}
                } else {
                    try {
                        intervalMinutes = Integer.parseInt(val);
                    } catch (NumberFormatException ignored) {}
                }
            }
            if (intervalMinutes <= 0) intervalMinutes = 30;

            DailyTimeIntervalScheduleBuilder sched = DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule()
                    .startingDailyAt(new TimeOfDay(startHour, startMinute))
                    .endingDailyAt(new TimeOfDay(endHour, endMinute))
                    .withInterval(intervalMinutes, DateBuilder.IntervalUnit.MINUTE);
            builder.withSchedule(sched);
        } else if ("WEEKLY".equalsIgnoreCase(intervalType)) {
            int dayOfWeek = DateBuilder.MONDAY;
            if (startDate != null) {
                dayOfWeek = startDate.getDayOfWeek().getValue() % 7 + 1;
            }
            builder.withSchedule(CronScheduleBuilder.weeklyOnDayAndHourAndMinute(dayOfWeek, startHour, startMinute));
        } else if ("MONTHLY".equalsIgnoreCase(intervalType)) {
            int dayOfMonth = 1;
            if (config.containsKey("dayOfMonth") && config.get("dayOfMonth") != null) {
                try {
                    dayOfMonth = Integer.parseInt(config.get("dayOfMonth").toString().trim());
                } catch (NumberFormatException ignored) {}
            } else if (startDate != null) {
                dayOfMonth = startDate.getDayOfMonth();
            }
            builder.withSchedule(CronScheduleBuilder.monthlyOnDayAndHourAndMinute(dayOfMonth, startHour, startMinute));
        } else {
            // DAILY
            if (everyDays <= 1) {
                builder.withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(startHour, startMinute));
            } else {
                builder.withSchedule(CalendarIntervalScheduleBuilder.calendarIntervalSchedule().withIntervalInDays(everyDays));
            }
        }

        LocalTime startTime = LocalTime.of(startHour, startMinute);
        ZonedDateTime startZdt = ZonedDateTime.of(startDate, startTime, ZoneId.of("UTC"));
        builder.startAt(Date.from(startZdt.toInstant()));

        String holidayOption = schedule.getHolidayOption();
        if (holidayOption != null && !"RUN_ALL_DAYS".equalsIgnoreCase(holidayOption)) {
            ensureHolidayCalendarRegistered();
            builder.modifiedByCalendar(HOLIDAY_CALENDAR_NAME);
        }

        return builder.build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeAuthorizedSchedules() {
        if (scheduler == null) {
            return;
        }
        try {
            ensureHolidayCalendarRegistered();
        } catch (Exception ex) {
            System.err.println("Failed to initialize holiday calendar: " + ex.getMessage());
        }

        List<ReportSchedule> authorized = scheduleRepository.findByAuthStatus("AUTHORIZED");
        for (ReportSchedule schedule : authorized) {
            try {
                registerQuartzJob(schedule);
            } catch (Exception ex) {
                System.err.println("Failed to re-register schedule on startup: " + schedule.getId() + " - " + ex.getMessage());
            }
        }
    }

    private void removeQuartzJob(String scheduleId) {
        if (scheduler == null) return;
        try {
            JobKey jobKey = JobKey.jobKey(scheduleId, "REPORT_SCHEDULES");
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
            }
        } catch (Exception ignored) {}
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
        removeQuartzJob(id);
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
