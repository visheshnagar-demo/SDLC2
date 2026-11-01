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
import com.citidirect.cashstatement.scheduling.repository.ReportScheduleRepository;
import com.citidirect.cashstatement.scheduling.repository.ScheduleHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportScheduleServiceTest {

    @Mock
    private ReportScheduleRepository scheduleRepository;

    @Mock
    private ScheduleHistoryRepository historyRepository;

    @Mock
    private DerivedReportRepository derivedReportRepository;

    @Mock
    private DeliveryOptionRepository deliveryOptionRepository;

    @Mock
    private AppUserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ReportScheduleService scheduleService;

    private DerivedReport derivedReport;
    private DeliveryOption deliveryOption;
    private ReportSchedule reportSchedule;

    @BeforeEach
    void setUp() {
        derivedReport = new DerivedReport();
        derivedReport.setId("dr-101");
        derivedReport.setDerivedReportName("Monthly Statement USD");
        derivedReport.setFormat("ADOBE_PDF");
        derivedReport.setCriteriaPayload("{\"accountNumber\":\"XX12CITI11223344446677\"}");

        deliveryOption = new DeliveryOption();
        deliveryOption.setId("del-201");
        deliveryOption.setName("Operations Email");
        deliveryOption.setEmailRecipients("ops@client.com");

        reportSchedule = new ReportSchedule();
        reportSchedule.setId("sched-901");
        reportSchedule.setScheduleName("Monthly Treasury Run");
        reportSchedule.setDerivedReportId("dr-101");
        reportSchedule.setDeliveryOptionId("del-201");
        reportSchedule.setIntervalType("MONTHLY");
        reportSchedule.setMakerId("usr-maker-1");
        reportSchedule.setAuthStatus("PENDING_AUTHORIZATION");
        reportSchedule.setIntervalConfig("{\"dayOfMonth\":1,\"hourGmt\":2}");
    }

    @Test
    @DisplayName("Create report schedule sets PENDING_AUTHORIZATION and saves configuration")
    void testCreateSchedule() {
        when(deliveryOptionRepository.findById("del-201")).thenReturn(Optional.of(deliveryOption));
        when(scheduleRepository.save(any(ReportSchedule.class))).thenAnswer(i -> i.getArgument(0));

        ScheduleRequest req = new ScheduleRequest();
        req.setScheduleName("Monthly Treasury Run");
        req.setDerivedReportId("dr-101");
        req.setDeliveryOptionId("del-201");
        req.setIntervalType("MONTHLY");
        req.setIntervalConfig(Map.of("dayOfMonth", 1, "hourGmt", 2));

        ScheduleResponse resp = scheduleService.createSchedule(req, "usr-maker-1");

        assertNotNull(resp);
        assertEquals("PENDING_AUTHORIZATION", resp.getAuthStatus());
        assertEquals("Monthly Treasury Run", resp.getScheduleName());
        assertEquals("usr-maker-1", resp.getMakerId());
    }

    @Test
    @DisplayName("Maker cannot authorize own schedule (Segregation of Duties)")
    void testMakerCannotAuthorizeOwnSchedule() {
        when(scheduleRepository.findById("sched-901")).thenReturn(Optional.of(reportSchedule));

        AuthorizationRequest authReq = new AuthorizationRequest("AUTHORIZE", "Approve schedule");

        assertThrows(IllegalStateException.class, () -> {
            scheduleService.authorizeSchedule("sched-901", authReq, "usr-maker-1");
        });
    }

    @Test
    @DisplayName("Independent checker can authorize schedule")
    void testCheckerCanAuthorizeSchedule() {
        when(scheduleRepository.findById("sched-901")).thenReturn(Optional.of(reportSchedule));
        when(scheduleRepository.save(any(ReportSchedule.class))).thenAnswer(i -> i.getArgument(0));

        AuthorizationRequest authReq = new AuthorizationRequest("AUTHORIZE", "Approved by checker");

        ScheduleResponse resp = scheduleService.authorizeSchedule("sched-901", authReq, "usr-checker-2");

        assertNotNull(resp);
        assertEquals("AUTHORIZED", resp.getAuthStatus());
        assertEquals("usr-checker-2", resp.getCheckerId());
    }
}
