import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ReportSchedule, ScheduleHistory } from '../../../../core/models/schedule.models';
import { DeliveryOption, MakerCheckerActionRequest } from '../../../../core/models/delivery.models';
import { UserProfile } from '../../../../core/models/entitlement.models';
import { MakerCheckerPanelComponent } from '../../../library/components/maker-checker-panel/maker-checker-panel.component';
import { ExecutionHistoryLogComponent } from '../../components/execution-history-log/execution-history-log.component';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MakerCheckerPanelComponent,
    ExecutionHistoryLogComponent
  ],
  templateUrl: './schedule-management.component.html',
  styleUrl: './schedule-management.component.scss'
})
export class ScheduleManagementComponent implements OnInit {
  activeTab: 'CREATE' | 'VIEW_ALL' | 'TO_AUTHORIZE' | 'HISTORY' = 'CREATE';

  scheduleForm!: FormGroup;
  schedules: ReportSchedule[] = [];
  authorizedDeliveryOptions: DeliveryOption[] = [];
  executionHistory: ScheduleHistory[] = [];
  currentUser!: UserProfile;

  // Authorize Modal
  showAuthorizeModal = false;
  scheduleToAuthorize: ReportSchedule | null = null;

  // Status
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';

  intervalOptions = [
    { label: 'Once', value: 'ONCE' },
    { label: 'Every 1 or More Days', value: 'EVERY_1_OR_MORE_DAYS' },
    { label: 'Every 1 or More Weeks', value: 'EVERY_1_OR_MORE_WEEKS' },
    { label: 'Every 1 or More Months', value: 'EVERY_1_OR_MORE_MONTHS' },
    { label: 'Event Based', value: 'EVENT_BASED' }
  ];

  holidayOptions = [
    { label: 'Run on Next Business Day', value: 'RUN_NEXT_BUSINESS_DAY' },
    { label: 'Run on Previous Business Day', value: 'RUN_PREV_BUSINESS_DAY' },
    { label: 'Run on All Days (Includes Holidays)', value: 'RUN_ALL_DAYS' }
  ];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private deliveryService: DeliveryOptionsService,
    private lookupService: LookupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.lookupService.getCurrentUser().subscribe(u => this.currentUser = u);
    this.initForm();
    this.loadData();

    this.route.queryParams.subscribe(params => {
      if (params['reportName']) {
        this.scheduleForm.patchValue({
          eventName: params['reportName']
        });
      }
      if (params['deliveryOptionId']) {
        this.scheduleForm.patchValue({
          deliveryOptionId: params['deliveryOptionId']
        });
      }
    });
  }

  initForm(): void {
    const refId = 'SCH-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    this.scheduleForm = this.fb.group({
      scheduleName: ['', [Validators.required]],
      eventType: [{ value: 'Report', disabled: true }],
      eventName: ['Account Statement – Comprehensive', Validators.required],
      serviceClassId: [{ value: 'Cash Statements Reports', disabled: true }],
      scheduleInterval: ['EVERY_1_OR_MORE_DAYS', Validators.required],
      holidayOption: ['RUN_NEXT_BUSINESS_DAY', Validators.required],
      scheduleReferenceId: [{ value: refId, disabled: true }],
      runTimeUser: [''],
      deliveryOptionId: ['', Validators.required],

      // Frequency Controls
      runStartDate: ['2023-01-25', Validators.required],
      runStartTime: ['07:30', Validators.required],
      runEveryDays: [1, [Validators.required, Validators.min(1)]],
      isDailyIntraDay: [false],
      intraDayInterval: ['01:00:00'],
      intraDayEndTime: ['17:30']
    });
  }

  loadData(): void {
    this.scheduleService.getSchedules().subscribe(schedules => {
      this.schedules = schedules;
    });

    this.deliveryService.getDeliveryOptions('ALL').subscribe(options => {
      this.authorizedDeliveryOptions = options.filter(o => o.authStatus === 'AUTHORIZED');
      if (this.authorizedDeliveryOptions.length > 0 && !this.scheduleForm.get('deliveryOptionId')?.value) {
        this.scheduleForm.patchValue({
          deliveryOptionId: this.authorizedDeliveryOptions[0].id
        });
      }
    });

    this.scheduleService.getExecutionHistory().subscribe(history => {
      this.executionHistory = history;
    });
  }

  get pendingAuthorizationSchedules(): ReportSchedule[] {
    return this.schedules.filter(s => s.authStatus === 'PENDING_AUTHORIZATION');
  }

  submitSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const payload = this.scheduleForm.getRawValue();
    const selDelivery = this.authorizedDeliveryOptions.find(d => d.id === payload.deliveryOptionId);
    if (selDelivery) {
      payload.deliveryOptionName = selDelivery.name;
    }

    this.scheduleService.createSchedule(payload).subscribe(created => {
      this.statusMessage = `Schedule '${created.scheduleName}' (${created.scheduleReferenceId}) submitted. Authorization Required.`;
      this.statusType = 'success';
      this.loadData();
      this.activeTab = 'VIEW_ALL';
      setTimeout(() => this.statusMessage = '', 5000);
    });
  }

  openAuthorizeSchedule(schedule: ReportSchedule): void {
    this.scheduleToAuthorize = schedule;
    this.showAuthorizeModal = true;
  }

  onAuthorizeAction(actionReq: MakerCheckerActionRequest): void {
    if (!this.scheduleToAuthorize) return;

    this.scheduleService.authorizeSchedule(this.scheduleToAuthorize.id, actionReq).subscribe(res => {
      this.statusMessage = res.message;
      this.statusType = 'success';
      this.showAuthorizeModal = false;
      this.scheduleToAuthorize = null;
      this.loadData();
      setTimeout(() => this.statusMessage = '', 5000);
    });
  }
}
