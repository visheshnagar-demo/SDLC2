import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { ReportSchedule, DeliveryOption } from '../../../../core/models/report.models';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-schedule-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  template: `
    <div class="schedule-builder-page">
      <app-breadcrumb currentSection="Schedule Builder &amp; Recurrence Engine"></app-breadcrumb>

      <!-- Royal Navy Banner Header -->
      <section class="citi-navy-banner">
        <div class="banner-title">
          <h2>Schedule Builder &amp; Automated Statement Recurrence Engine</h2>
          <p class="banner-subtext">Configure automated batch report generation schedules with intraday intervals and dual-control maker-checker routing.</p>
        </div>
      </section>

      <!-- Main Schedule Config Form Card -->
      <div class="citi-schedule-card">
        <form [formGroup]="scheduleForm" (ngSubmit)="onSubmitSchedule()">
          <div class="schedule-form-grid">
            
            <!-- Left Column: Recurrence Details -->
            <div class="form-col">
              <h3 class="section-title">Recurrence Pattern &amp; Timings</h3>

              <div class="citi-form-group">
                <label>Schedule Task Name <span class="required">*</span></label>
                <input type="text" formControlName="scheduleName" placeholder="e.g. Daily APAC Treasury Cash Position" />
              </div>

              <div class="citi-form-group">
                <label>Target Base Report Template <span class="required">*</span></label>
                <select formControlName="reportTemplateId">
                  <option value="REP-1001">REP-1001: Account Statement - Comprehensive</option>
                  <option value="REP-1002">REP-1002: APAC Intra-Day Ledger Summary</option>
                  <option value="REP-1003">REP-1003: EMEA Corporate Cash Balance</option>
                  <option value="REP-1004">REP-1004: Treasury Dual-Control Cash Flow</option>
                </select>
              </div>

              <div class="form-row-2col">
                <div class="citi-form-group">
                  <label>Start Date <span class="required">*</span></label>
                  <input type="date" formControlName="startDate" />
                </div>
                <div class="citi-form-group">
                  <label>Execution Time (UTC) <span class="required">*</span></label>
                  <input type="time" formControlName="startTime" />
                </div>
              </div>

              <div class="citi-form-group">
                <label>Frequency Type <span class="required">*</span></label>
                <div class="radio-horizontal">
                  <label><input type="radio" formControlName="frequency" value="DAILY" /> Daily</label>
                  <label><input type="radio" formControlName="frequency" value="WEEKLY" /> Weekly</label>
                  <label><input type="radio" formControlName="frequency" value="MONTHLY" /> Monthly</label>
                </div>
              </div>
            </div>

            <!-- Right Column: Intraday Spinners & Delivery Target -->
            <div class="form-col">
              <h3 class="section-title">Intraday Frequency &amp; Dispatch Destination</h3>

              <div class="citi-form-group">
                <label>Intraday Interval Spinners (HH:MM:SS)</label>
                <div class="spinners-group">
                  <div class="spinner-box">
                    <span>Hours:</span>
                    <input type="number" formControlName="intradayHours" min="0" max="23" />
                  </div>
                  <div class="spinner-box">
                    <span>Mins:</span>
                    <input type="number" formControlName="intradayMinutes" min="0" max="59" />
                  </div>
                  <div class="spinner-box">
                    <span>Secs:</span>
                    <input type="number" formControlName="intradaySeconds" min="0" max="59" />
                  </div>
                </div>
              </div>

              <div class="citi-form-group">
                <label>Trigger Event Trigger</label>
                <select formControlName="triggerEvent">
                  <option value="SCHEDULED_CRON">Scheduled Clock Time (Quartz Engine)</option>
                  <option value="END_OF_DAY">End of Day Processing (EOD Batch)</option>
                  <option value="STATEMENT_POSTING">Post-Transaction Ledger Closing</option>
                  <option value="SWIFT_MT940_READY">SWIFT MT940 Dispatch Trigger</option>
                </select>
              </div>

              <div class="citi-form-group">
                <label>Delivery Target Profile</label>
                <select formControlName="deliveryOptionId">
                  <option value="">-- None (In-App Archive Only) --</option>
                  @for (opt of deliveryOptions(); track opt.id) {
                    <option [value]="opt.id">
                      {{ opt.id }} ({{ opt.channelType }}) - {{ opt.destinationTarget }}
                    </option>
                  }
                </select>
              </div>

              <div class="citi-form-group">
                <label>Notification Email Addresses (Comma Separated)</label>
                <input type="text" formControlName="notifyEmails" placeholder="ops-lead@citi.com, audit@citi.com" />
              </div>
            </div>

          </div>

          <div class="citi-btn-bar">
            <button type="button" class="citi-btn-secondary" (click)="resetForm()">Reset To Defaults</button>
            <button type="submit" class="citi-btn-primary" [disabled]="scheduleForm.invalid">
              Submit Schedule for Dual-Control Authorization
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Schedules Grid Section -->
      <div class="existing-schedules-section">
        <h3 class="section-heading">Active &amp; Pending Scheduled Tasks</h3>
        
        <div class="citi-table-container">
          <table class="citi-data-table">
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>Task Name</th>
                <th>Report Name</th>
                <th>Frequency</th>
                <th>Start Date &amp; Time</th>
                <th>Maker User</th>
                <th>Status</th>
                <th>Dual-Control Checker</th>
              </tr>
            </thead>
            <tbody>
              @for (sched of schedules(); track sched.id) {
                <tr>
                  <td><strong>{{ sched.id }}</strong></td>
                  <td>{{ sched.scheduleName }}</td>
                  <td>{{ sched.baseReportName || sched.reportTemplateId }}</td>
                  <td><span class="freq-tag">{{ sched.frequency }}</span></td>
                  <td>{{ sched.startDate }} {{ sched.startTime }} UTC</td>
                  <td><code>{{ sched.makerId }}</code></td>
                  <td>
                    <span class="citi-badge" [ngClass]="sched.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'">
                      {{ sched.status }}
                    </span>
                  </td>
                  <td>{{ sched.checkerId || 'Awaiting Authorization' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .schedule-builder-page {
      padding-bottom: 40px;
    }

    .citi-navy-banner {
      background-color: $citi-royal-navy;
      color: #FFFFFF;
      padding: 16px 20px;
      border-bottom: 2px solid $citi-cyan-accent;

      h2 {
        color: #FFFFFF;
        font-size: 15px;
        font-weight: 700;
      }

      .banner-subtext {
        font-size: 11px;
        color: #D9E2EA;
        margin-top: 4px;
      }
    }

    .citi-schedule-card {
      margin: 16px 20px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 2px;
      padding: 20px;

      .schedule-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;

        .form-col {
          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: $citi-core-blue;
            padding-bottom: 6px;
            margin-bottom: 14px;
            border-bottom: 2px solid $citi-surface-table-head;
          }
        }
      }

      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .radio-horizontal {
        display: flex;
        gap: 16px;
        font-size: 12px;
        margin-top: 6px;

        label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
      }

      .spinners-group {
        display: flex;
        gap: 12px;

        .spinner-box {
          display: flex;
          align-items: center;
          gap: 6px;

          span {
            font-size: 11px;
            font-weight: 600;
            color: $citi-text-secondary;
          }

          input {
            width: 50px;
            height: $citi-input-height;
            padding: 0 6px;
            border: 1px solid $citi-border-input;
            border-radius: 2px;
            text-align: center;
          }
        }
      }

      .citi-btn-bar {
        margin-top: 20px;
        padding-top: 14px;
        border-top: 1px solid $citi-border-subtle;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }

    .existing-schedules-section {
      margin: 20px;

      .section-heading {
        font-size: 14px;
        font-weight: 700;
        color: $citi-core-blue;
        margin-bottom: 10px;
      }

      .freq-tag {
        font-weight: 700;
        color: $citi-core-blue;
      }
    }
  `]
})
export class ScheduleBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);

  scheduleForm!: FormGroup;
  schedules = signal<ReportSchedule[]>([]);
  deliveryOptions = signal<DeliveryOption[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.scheduleForm = this.fb.group({
      scheduleName: ['Daily APAC Treasury Statement', Validators.required],
      reportTemplateId: ['REP-1001', Validators.required],
      startDate: ['2026-04-01', Validators.required],
      startTime: ['08:00', Validators.required],
      frequency: ['DAILY', Validators.required],
      intradayHours: [0],
      intradayMinutes: [30],
      intradaySeconds: [0],
      triggerEvent: ['SCHEDULED_CRON'],
      deliveryOptionId: ['DEL-001'],
      notifyEmails: ['treasury-ops@corp.citi.com']
    });
  }

  loadData() {
    this.reportService.getSchedules().subscribe(res => this.schedules.set(res));
    this.deliveryService.getDeliveryOptions().subscribe(res => this.deliveryOptions.set(res));
  }

  onSubmitSchedule() {
    if (this.scheduleForm.invalid) return;

    this.reportService.createSchedule(this.scheduleForm.value).subscribe(newSched => {
      alert(`Schedule submitted for Dual-Control Authorization!\nTask ID: ${newSched.id}\nStatus: PENDING_AUTHORIZATION\nMust be approved by a distinct Checker.`);
      this.loadData();
    });
  }

  resetForm() {
    this.initForm();
  }
}
