package com.citi.cashstatement.controller;

import com.citi.cashstatement.dto.ScheduleDTO;
import com.citi.cashstatement.service.ReportSchedulerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cash-statements/schedules")
public class ScheduleController {

    private final ReportSchedulerService reportSchedulerService;

    public ScheduleController(ReportSchedulerService reportSchedulerService) {
        this.reportSchedulerService = reportSchedulerService;
    }

    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getAllSchedules() {
        return ResponseEntity.ok(reportSchedulerService.getAllSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleDTO> getScheduleById(@PathVariable String id) {
        return ResponseEntity.ok(reportSchedulerService.getScheduleById(id));
    }

    @PostMapping
    public ResponseEntity<ScheduleDTO> createSchedule(
            @RequestBody ScheduleDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_maker_101") String userId) {
        ScheduleDTO created = reportSchedulerService.createSchedule(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleDTO> updateSchedule(
            @PathVariable String id,
            @RequestBody ScheduleDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_maker_101") String userId) {
        ScheduleDTO updated = reportSchedulerService.updateSchedule(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_maker_101") String userId) {
        reportSchedulerService.deleteSchedule(id, userId);
        return ResponseEntity.noContent().build();
    }
}
