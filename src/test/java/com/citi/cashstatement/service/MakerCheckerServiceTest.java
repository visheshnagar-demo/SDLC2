package com.citi.cashstatement.service;

import com.citi.cashstatement.entity.MakerCheckerRequest;
import com.citi.cashstatement.repository.MakerCheckerRequestRepository;
import com.citi.cashstatement.repository.ReportScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MakerCheckerServiceTest {

    @Mock
    private MakerCheckerRequestRepository makerCheckerRequestRepository;

    @Mock
    private ReportScheduleRepository reportScheduleRepository;

    @Mock
    private AuditLoggerService auditLoggerService;

    @InjectMocks
    private MakerCheckerService makerCheckerService;

    private MakerCheckerRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleRequest = new MakerCheckerRequest();
        sampleRequest.setId(UUID.randomUUID().toString());
        sampleRequest.setResourceType("REPORT_SCHEDULE");
        sampleRequest.setResourceId(UUID.randomUUID().toString());
        sampleRequest.setMakerId("usr_maker_101");
        sampleRequest.setStatus("PENDING");
        sampleRequest.setSubmittedAt(OffsetDateTime.now());
    }

    @Test
    void testApproveRequestByDifferentUser_Success() {
        when(makerCheckerRequestRepository.findById(sampleRequest.getId())).thenReturn(Optional.of(sampleRequest));
        when(makerCheckerRequestRepository.save(any(MakerCheckerRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MakerCheckerRequest approved = makerCheckerService.approveRequest(sampleRequest.getId(), "usr_checker_202", "Looks good");

        assertNotNull(approved);
        assertEquals("APPROVED", approved.getStatus());
        assertEquals("usr_checker_202", approved.getCheckerId());
        assertEquals("Looks good", approved.getCheckerComments());
    }

    @Test
    void testApproveRequestBySameUser_ThrowsForbidden() {
        when(makerCheckerRequestRepository.findById(sampleRequest.getId())).thenReturn(Optional.of(sampleRequest));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            makerCheckerService.approveRequest(sampleRequest.getId(), "usr_maker_101", "Self approve");
        });

        assertEquals(403, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("Maker cannot authorize their own submission"));
    }

    @Test
    void testRejectRequest_Success() {
        when(makerCheckerRequestRepository.findById(sampleRequest.getId())).thenReturn(Optional.of(sampleRequest));
        when(makerCheckerRequestRepository.save(any(MakerCheckerRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MakerCheckerRequest rejected = makerCheckerService.rejectRequest(sampleRequest.getId(), "usr_checker_202", "Incomplete parameters");

        assertNotNull(rejected);
        assertEquals("REJECTED", rejected.getStatus());
        assertEquals("usr_checker_202", rejected.getCheckerId());
    }
}
