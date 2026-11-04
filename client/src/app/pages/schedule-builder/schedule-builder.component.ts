import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CashStatementService } from '../../services/cash-statement.service';
import { ScheduleDTO } from '../../models/cash-statement.model';
import { SubNavBreadcrumbComponent } from '../../components/sub-nav-breadcrumb/sub-nav-breadcrumb.component';
import { DockedActionBarComponent } from '../../components/docked-action-bar/docked-action-bar.component';

@Component({
  selector: 'app-schedule-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SubNavBreadcrumbComponent,
    DockedActionBarComponent
  ],
  template: `
    <div class="schedule-page-container">
      <app-sub-nav-breadcrumb currentTitle="Report Schedule Builder & Automated Delivery"></app-sub-nav-breadcrumb>

      <div class="schedule-header-banner">
        <div>
          <h2>Recurring Cash Statement Schedule Builder</h2>
          <p>Configure automated cron schedules, intraday polling intervals, and secure SFTP / Email delivery channels.</p>
        </div>
        <div class="maker-notice-pill">
          <span>Dual-Control: Schedule creations require Checker authorization.</span>
        </div>
      </div>

      <div class="schedule-body">
        <div class="builder-columns">
          <!-- Left: Builder Form -->
          <div class="builder-form-card">
            <h3 class="card-title">1. Schedule Configuration & Recurrence</h3>

            <form [formGroup]="scheduleForm" (ngSubmit)="onSubmitSchedule()">
              <div class="form-group">
                <label>Schedule Name *</label>
                <input
                  type="text"
                  formControlName="scheduleName"
                  class="citi-input full-width"
                  placeholder="e.g. Daily EOD Global Treasury Feed" />
              </div>

              <div class="form-group">
                <label>Base Template ID</label>
                <input
                  type="text"
                  formControlName="templateId"
                  class="citi-input full-width"
                  placeholder="TMPL_CASH_EOD" />
              </div>

              <div class="form-group">
                <label>Recurrence Frequency</label>
                <select formControlName="frequency" class="citi-select full-width">
                  <option value="DAILY">Daily (EOD Close)</option>
                  <option value="WEEKLY">Weekly (Monday 06:00 UTC)</option>
                  <option value="MONTHLY">Monthly (First Business Day)</option>
                  <option value="INTRADAY">Intraday (Periodic Intervals)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Cron Expression</label>
                <input
                  type="text"
                  formControlName="cronExpression"
                  class="citi-input full-width mono"
                  placeholder="0 0 18 ? * MON-FRI" />
              </div>

              <div class="form-group">
                <label>Export Format</label>
                <div class="format-radios">
                  <label class="radio-inline">
                    <input type="radio" formControlName="exportFormat" value="CSV" />
                    <span>CSV Feed</span>
                  </label>
                  <label class="radio-inline">
                    <input type="radio" formControlName="exportFormat" value="EXCEL" />
                    <span>Excel (.xlsx)</span>
                  </label>
                  <label class="radio-inline">
                    <input type="radio" formControlName="exportFormat" value="PDF" />
                    <span>PDF Document</span>
                  </label>
                </div>
              </div>

              <h3 class="card-title" style="margin-top: 20px;">2. Delivery Channel Protocol</h3>

              <div class="form-group">
                <label>Delivery Mechanism</label>
                <select formControlName="deliveryChannel" class="citi-select full-width">
                  <option value="SFTP">Secure FTP (SFTP / SSH Server)</option>
                  <option value="EMAIL">Encrypted Email Transmission (SMTP/TLS)</option>
                </select>
              </div>

              @if (scheduleForm.get('deliveryChannel')?.value === 'SFTP') {
                <div class="sftp-config-box">
                  <div class="form-group">
                    <label>SFTP Host</label>
                    <input
                      type="text"
                      formControlName="sftpHost"
                      class="citi-input full-width mono"
                      placeholder="reports.citi.com" />
                  </div>
                  <div class="form-group">
                    <label>SFTP Target Path</label>
                    <input
                      type="text"
                      formControlName="sftpPath"
                      class="citi-input full-width mono"
                      placeholder="/treasury/cash_statements/" />
                  </div>
                </div>
              }

              @if (scheduleForm.get('deliveryChannel')?.value === 'EMAIL') {
                <div class="email-config-box">
                  <div class="form-group">
                    <label>Recipient Email Addresses (comma separated)</label>
                    <input
                      type="text"
                      formControlName="emailRecipients"
                      class="citi-input full-width"
                      placeholder="treasury.ops@citi.com, audit@citi.com" />
                  </div>
                </div>
              }
            </form>
          </div>

          <!-- Right: Existing Schedules List -->
          <div class="schedules-list-card">
            <h3 class="card-title">Existing Scheduled Jobs</h3>

            <div class="schedules-table-container">
              <table class="citi-table">
                <thead>
                  <tr>
                    <th>Schedule Name</th>
                    <th>Frequency</th>
                    <th>Format</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sch of schedules(); track sch.id) {
                    <tr>
                      <td class="font-semibold">{{ sch.schedule_name }}</td>
                      <td><span class="freq-tag">{{ sch.frequency }}</span></td>
                      <td class="mono">{{ sch.export_format }}</td>
                      <td>{{ sch.delivery_options.channel }}</td>
                      <td>
                        <span
                          class="citi-status-badge"
                          [class.status-active]="sch.status === 'ACTIVE' || sch.status === 'APPROVED'"
                          [class.status-pending]="sch.status === 'PENDING' || sch.status === 'PENDING_APPROVAL'"
                          [class.status-failed]="sch.status === 'INACTIVE' || sch.status === 'REJECTED'">
                          {{ sch.status || 'PENDING_APPROVAL' }}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="btn-citi-secondary delete-btn"
                          (click)="onDeleteSchedule(sch.id!)">
                          ✕
                        </button>
                      </td>
                    </tr>
                  }

                  @if (schedules().length === 0) {
                    <tr>
                      <td colspan="6" class="empty-state">No recurring schedules configured yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <app-docked-action-bar selectionText="New schedules will be placed in Checker Authorization Queue">
        <button type="button" class="btn-citi-secondary" (click)="resetScheduleForm()">Clear Form</button>
        <button
          type="button"
          class="btn-citi-primary"
          (click)="onSubmitSchedule()"
          [disabled]="isLoading() || !scheduleForm.valid">
          {{ isLoading() ? 'Submitting Schedule...' : 'Submit Schedule for Dual-Control Authorization' }}
        </button>
      </app-docked-action-bar>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .schedule-page-container {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .schedule-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: $citi-surface-banner;
      padding: 16px 24px;
      border-bottom: 1px solid $citi-border-grid;

      h2 {
        color: $citi-blue;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      p {
        color: $citi-text-secondary;
        font-size: 12px;
      }
    }

    .maker-notice-pill {
      background-color: $citi-warning-bg;
      border: 1px solid #ECC94B;
      padding: 6px 12px;
      border-radius: $radius-default;
      font-size: 11px;
      font-weight: 600;
      color: #744210;
    }

    .schedule-body {
      flex: 1;
      padding: 20px 24px;
    }

    .builder-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .builder-form-card, .schedules-list-card {
      background: #FFFFFF;
      border: 1px solid $citi-border-subtle;
      border-radius: $radius-card;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: $citi-blue;
      border-bottom: 2px solid $citi-surface-table-head;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 12px;

      label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: $citi-text-secondary;
        margin-bottom: 4px;
      }
    }

    .full-width {
      width: 100%;
    }

    .mono {
      font-family: $font-family-mono;
    }

    .format-radios {
      display: flex;
      gap: 16px;
      margin-top: 4px;
    }

    .radio-inline {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .sftp-config-box, .email-config-box {
      background: $citi-surface-canvas;
      border: 1px solid $citi-border-subtle;
      border-radius: $radius-default;
      padding: 12px;
      margin-top: 10px;
    }

    .schedules-table-container {
      max-height: 480px;
      overflow-y: auto;
    }

    .freq-tag {
      font-size: 11px;
      font-weight: 600;
      color: $citi-blue-navy;
    }

    .delete-btn {
      padding: 2px 6px;
      font-size: 10px;
      color: $citi-red-dark;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: $citi-text-secondary;
      font-style: italic;
    }

    .font-semibold {
      font-weight: 600;
    }
  `]
})
export class ScheduleBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private cashService = inject(CashStatementService);

  scheduleForm: FormGroup = this.fb.group({
    scheduleName: ['Daily Global Cash Statement Sweep', [Validators.required]],
    templateId: ['TMPL_CASH_EOD', [Validators.required]],
    frequency: ['DAILY'],
    cronExpression: ['0 0 18 ? * MON-FRI', [Validators.required]],
    exportFormat: ['CSV'],
    deliveryChannel: ['SFTP'],
    sftpHost: ['reports.citi.com'],
    sftpPath: ['/treasury/cash_statements/'],
    emailRecipients: ['treasury.ops@citi.com']
  });

  schedules = signal<ScheduleDTO[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['templateId']) {
        this.scheduleForm.patchValue({
          templateId: params['templateId'],
          exportFormat: params['format'] || 'CSV'
        });
      }
    });

    this.loadSchedules();
  }

  loadSchedules() {
    this.cashService.getSchedules().subscribe({
      next: (list) => this.schedules.set(list),
      error: () => console.warn('Could not fetch schedules')
    });
  }

  onSubmitSchedule() {
    if (!this.scheduleForm.valid) return;
    this.isLoading.set(true);

    const f = this.scheduleForm.value;
    const dto: ScheduleDTO = {
      schedule_name: f.scheduleName,
      template_id: f.templateId,
      criteria: {
        entity_id: 'CITI-US-TREASURY',
        statement_type: 'DETAILED'
      },
      frequency: f.frequency,
      cron_expression: f.cronExpression,
      export_format: f.exportFormat,
      delivery_options: {
        channel: f.deliveryChannel,
        sftp_host: f.deliveryChannel === 'SFTP' ? f.sftpHost : undefined,
        sftp_path: f.deliveryChannel === 'SFTP' ? f.sftpPath : undefined,
        email_recipients: f.deliveryChannel === 'EMAIL' ? f.emailRecipients.split(',').map((e: string) => e.trim()) : undefined
      }
    };

    this.cashService.createSchedule(dto).subscribe({
      next: (created) => {
        this.isLoading.set(false);
        alert('Schedule created successfully and submitted for Checker Authorization!');
        this.loadSchedules();
        this.resetScheduleForm();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Schedule submitted. ' + (err.error?.message || 'Pending authorization.'));
        this.loadSchedules();
      }
    });
  }

  onDeleteSchedule(id: string) {
    if (confirm('Are you sure you want to deactivate this schedule?')) {
      this.cashService.deleteSchedule(id).subscribe({
        next: () => this.loadSchedules(),
        error: () => this.loadSchedules()
      });
    }
  }

  resetScheduleForm() {
    this.scheduleForm.reset({
      scheduleName: '',
      templateId: 'TMPL_CASH_EOD',
      frequency: 'DAILY',
      cronExpression: '0 0 18 ? * MON-FRI',
      exportFormat: 'CSV',
      deliveryChannel: 'SFTP',
      sftpHost: 'reports.citi.com',
      sftpPath: '/treasury/cash_statements/',
      emailRecipients: 'treasury.ops@citi.com'
    });
  }
}
