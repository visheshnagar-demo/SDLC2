package com.citidirect.cashstatement.scheduling;

import com.citidirect.cashstatement.auth.UserPrincipal;
import com.citidirect.cashstatement.delivery.dto.AuthorizationRequest;
import com.citidirect.cashstatement.scheduling.dto.ScheduleRequest;
import com.citidirect.cashstatement.scheduling.dto.ScheduleResponse;
import com.citidirect.cashstatement.scheduling.model.ScheduleHistory;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ReportScheduleService scheduleService;
    private final QuartzReportJob quartzReportJob;

    public ScheduleController(ReportScheduleService scheduleService, QuartzReportJob quartzReportJob) {
        this.scheduleService = scheduleService;
        this.quartzReportJob = quartzReportJob;
    }

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> listSchedules(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(scheduleService.listSchedules(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponse> getSchedule(@PathVariable String id) {
        return ResponseEntity.ok(scheduleService.getSchedule(id));
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @Valid @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String makerId = principal != null ? principal.getId() : "usr-001";
        ScheduleResponse response = scheduleService.createSchedule(request, makerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<ScheduleResponse> authorizeSchedule(
            @PathVariable String id,
            @Valid @RequestBody AuthorizationRequest authRequest,
            @AuthenticationPrincipal UserPrincipal principal) {
        String checkerId = principal != null ? principal.getId() : "usr-002";
        ScheduleResponse response = scheduleService.authorizeSchedule(id, authRequest, checkerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<Void> triggerScheduleNow(@PathVariable String id) {
        quartzReportJob.executeSchedule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ScheduleHistory>> getScheduleHistory(@PathVariable String id) {
        return ResponseEntity.ok(scheduleService.getScheduleHistory(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable String id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
