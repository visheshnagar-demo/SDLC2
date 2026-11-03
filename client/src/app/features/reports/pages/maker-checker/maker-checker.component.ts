import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { ReportSchedule, DeliveryOption } from '../../../../core/models/report.models';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-maker-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  template: `
    <div class="maker-checker-page">
      <app-breadcrumb currentSection="Dual-Control Authorization Queue"></app-breadcrumb>

      <!-- Dual-Control Governance Notice Banner -->
      <section class="citi-governance-banner">
        <div class="gov-icon">&#9888;</div>
        <div class="gov-text">
          <strong>CitiDirect Dual-Control Governance Policy:</strong>
          All recurring statement schedules and outbound delivery channels created by a Maker require independent authorization by an authorized Checker prior to activation. Self-authorization is strictly prohibited.
        </div>
      </section>

      <!-- Sub-tabs Navigation -->
      <div class="workflow-tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'SCHEDULES'" 
          (click)="activeTab.set('SCHEDULES')">
          Pending Schedules ({{ pendingSchedules().length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'DELIVERY'" 
          (click)="activeTab.set('DELIVERY')">
          Pending Delivery Channels ({{ pendingDeliveries().length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'AUDIT'" 
          (click)="activeTab.set('AUDIT')">
          Dual-Control Audit Trail Log
        </button>
      </div>

      <!-- Main Queue Container -->
      <div class="queue-card">
        
        <!-- Tab 1: Pending Schedules Table -->
        @if (activeTab() === 'SCHEDULES') {
          <div class="citi-table-container">
            <table class="citi-data-table">
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Task Name</th>
                  <th>Target Report</th>
                  <th>Frequency</th>
                  <th>Maker ID</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th style="text-align: center; width: 180px;">Checker Action</th>
                </tr>
              </thead>
              <tbody>
                @for (sched of pendingSchedules(); track sched.id) {
                  <tr>
                    <td><strong>{{ sched.id }}</strong></td>
                    <td>{{ sched.scheduleName }}</td>
                    <td>{{ sched.baseReportName || sched.reportTemplateId }}</td>
                    <td>{{ sched.frequency }}</td>
                    <td><code>{{ sched.makerId }}</code></td>
                    <td>{{ sched.startDate }} {{ sched.startTime }} UTC</td>
                    <td>
                      <span class="citi-badge badge-pending">{{ sched.status }}</span>
                    </td>
                    <td style="text-align: center;">
                      <div class="action-buttons-group">
                        <button class="citi-btn-primary btn-xs" (click)="authorizeSchedule(sched)">
                          Authorize
                        </button>
                        <button class="citi-btn-danger btn-xs" (click)="openRejectModal('SCHEDULE', sched.id)">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">&#10004; All scheduled jobs have been authorized. Queue is clear.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Tab 2: Pending Delivery Channels Table -->
        @if (activeTab() === 'DELIVERY') {
          <div class="citi-table-container">
            <table class="citi-data-table">
              <thead>
                <tr>
                  <th>Option ID</th>
                  <th>Channel Type</th>
                  <th>Target Host / Email</th>
                  <th>Encryption Protocol</th>
                  <th>Maker ID</th>
                  <th>Status</th>
                  <th style="text-align: center; width: 180px;">Checker Action</th>
                </tr>
              </thead>
              <tbody>
                @for (del of pendingDeliveries(); track del.id) {
                  <tr>
                    <td><strong>{{ del.id }}</strong></td>
                    <td><strong>{{ del.channelType }}</strong></td>
                    <td><code>{{ del.destinationTarget }}</code></td>
                    <td>{{ del.encryptionProtocol }}</td>
                    <td><code>{{ del.makerId }}</code></td>
                    <td>
                      <span class="citi-badge badge-pending">{{ del.status }}</span>
                    </td>
                    <td style="text-align: center;">
                      <div class="action-buttons-group">
                        <button class="citi-btn-primary btn-xs" (click)="authorizeDelivery(del)">
                          Authorize
                        </button>
                        <button class="citi-btn-danger btn-xs" (click)="openRejectModal('DELIVERY', del.id)">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">&#10004; No pending delivery channel options requiring review.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Tab 3: Audit Trail Journal -->
        @if (activeTab() === 'AUDIT') {
          <div class="audit-journal">
            <h4 class="audit-title">Dual-Control Immutable Audit Journal</h4>
            <div class="citi-table-container">
              <table class="citi-data-table">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Timestamp (UTC)</th>
                    <th>Actor (Checker / Maker)</th>
                    <th>Action</th>
                    <th>Target Resource</th>
                    <th>Details &amp; Reason</th>
                  </tr>
                </thead>
                <tbody>
                  @for (log of auditLogs(); track log.id) {
                    <tr>
                      <td><code>{{ log.id }}</code></td>
                      <td>{{ log.timestamp }}</td>
                      <td><strong>{{ log.actorId }}</strong></td>
                      <td><span class="action-tag">{{ log.action }}</span></td>
                      <td>{{ log.targetId }}</td>
                      <td>{{ log.details }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      </div>

      <!-- Rejection Modal -->
      @if (showRejectModal()) {
        <div class="citi-modal-overlay" (click)="closeRejectModal()">
          <div class="citi-modal-card" (click)="$event.stopPropagation()">
            <header class="citi-modal-header">
              <h3>Mandatory Dual-Control Rejection Reason</h3>
              <button class="close-btn" (click)="closeRejectModal()">&times;</button>
            </header>
            <div class="citi-modal-body">
              <p class="modal-notice">
                Please provide an auditable justification for rejecting item <strong>{{ targetRejectId() }}</strong>.
              </p>
              <div class="citi-form-group">
                <label>Rejection Reason Description <span class="required">*</span></label>
                <textarea [(ngModel)]="rejectionReason" placeholder="State reason for compliance / operations rejection..."></textarea>
              </div>
            </div>
            <footer class="citi-modal-footer">
              <button class="citi-btn-secondary" (click)="closeRejectModal()">Cancel</button>
              <button class="citi-btn-danger" [disabled]="!rejectionReason.trim()" (click)="confirmReject()">
                Confirm Rejection
              </button>
            </footer>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .maker-checker-page {
      padding-bottom: 40px;
    }

    .citi-governance-banner {
      margin: 16px 20px;
      background-color: $citi-warning-bg;
      border: 1px solid #ECC94B;
      border-left: 4px solid #D69E2E;
      border-radius: 2px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .gov-icon {
        font-size: 20px;
        color: #B7791F;
      }

      .gov-text {
        font-size: 12px;
        color: #744210;
        line-height: 1.4;
      }
    }

    .workflow-tabs {
      margin: 0 20px;
      display: flex;
      gap: 4px;
      border-bottom: 1px solid $citi-border-grid;

      .tab-btn {
        padding: 8px 16px;
        background: #E9EEF3;
        border: 1px solid $citi-border-grid;
        border-bottom: none;
        border-radius: 3px 3px 0 0;
        font-family: $citi-font-family;
        font-size: 12px;
        font-weight: 600;
        color: $citi-text-secondary;
        cursor: pointer;

        &.active {
          background: #FFFFFF;
          color: $citi-core-blue;
          font-weight: 700;
          border-bottom: 2px solid #FFFFFF;
          margin-bottom: -1px;
        }
      }
    }

    .queue-card {
      margin: 0 20px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-top: none;
      padding: 16px;

      .action-buttons-group {
        display: flex;
        justify-content: center;
        gap: 6px;
      }

      .btn-xs {
        height: 22px;
        padding: 0 8px;
        font-size: 11px;
      }

      .empty-state {
        text-align: center;
        padding: 30px;
        color: $citi-success;
        font-weight: 600;
      }

      .audit-title {
        font-size: 13px;
        font-weight: 700;
        color: $citi-core-blue;
        margin-bottom: 10px;
      }

      .action-tag {
        font-weight: 700;
        color: $citi-core-blue;
      }
    }

    .citi-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(34, 48, 62, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .citi-modal-card {
      width: 500px;
      background: #FFFFFF;
      border-radius: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .citi-modal-header {
      background: $citi-dark-midnight;
      color: #FFFFFF;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        color: #FFFFFF;
        font-size: 13px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #FFFFFF;
        font-size: 18px;
        cursor: pointer;
      }
    }

    .citi-modal-body {
      padding: 16px;

      .modal-notice {
        font-size: 12px;
        margin-bottom: 12px;
        color: $citi-text-primary;
      }
    }

    .citi-modal-footer {
      padding: 10px 16px;
      background: $citi-surface-canvas;
      border-top: 1px solid $citi-border-subtle;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class MakerCheckerComponent implements OnInit {
  private reportService = inject(ReportService);
  private deliveryService = inject(DeliveryService);

  activeTab = signal<'SCHEDULES' | 'DELIVERY' | 'AUDIT'>('SCHEDULES');
  schedules = signal<ReportSchedule[]>([]);
  deliveries = signal<DeliveryOption[]>([]);

  showRejectModal = signal(false);
  targetRejectType = signal<'SCHEDULE' | 'DELIVERY'>('SCHEDULE');
  targetRejectId = signal('');
  rejectionReason = '';

  auditLogs = signal([
    {
      id: 'AUD-8849',
      timestamp: '2026-03-31 16:45:10',
      actorId: 'user_checker_01',
      action: 'AUTHORIZE_SCHEDULE',
      targetId: 'SCHED-1030',
      details: 'Approved weekly statement schedule for EMEA treasury reconciliation.'
    },
    {
      id: 'AUD-8848',
      timestamp: '2026-03-31 15:30:22',
      actorId: 'user_checker_01',
      action: 'AUTHORIZE_DELIVERY',
      targetId: 'DEL-002',
      details: 'Approved TLS 1.3 encrypted email dispatch endpoint.'
    },
    {
      id: 'AUD-8847',
      timestamp: '2026-03-31 14:10:00',
      actorId: 'user_maker_01',
      action: 'SUBMIT_SCHEDULE',
      targetId: 'SCHED-1029',
      details: 'Initiated daily APAC Treasury statement generation job.'
    }
  ]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.reportService.getSchedules().subscribe(res => this.schedules.set(res));
    this.deliveryService.getDeliveryOptions().subscribe(res => this.deliveries.set(res));
  }

  pendingSchedules(): ReportSchedule[] {
    return this.schedules().filter(s => s.status === 'PENDING_AUTHORIZATION');
  }

  pendingDeliveries(): DeliveryOption[] {
    return this.deliveries().filter(d => d.status === 'PENDING_AUTHORIZATION');
  }

  authorizeSchedule(sched: ReportSchedule) {
    this.reportService.authorizeSchedule(sched.id).subscribe(() => {
      alert(`Schedule ${sched.id} Authorized Successfully!\nState updated to ACTIVE. Execution jobs scheduled in Quartz.`);
      this.auditLogs.update(logs => [{
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorId: 'user_checker_01',
        action: 'AUTHORIZE_SCHEDULE',
        targetId: sched.id,
        details: `Checker authorized schedule: ${sched.scheduleName}`
      }, ...logs]);
      this.loadData();
    });
  }

  authorizeDelivery(del: DeliveryOption) {
    this.deliveryService.authorizeDeliveryOption(del.id).subscribe(() => {
      alert(`Delivery Endpoint ${del.id} Authorized Successfully!\nChannel is now ACTIVE.`);
      this.auditLogs.update(logs => [{
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorId: 'user_checker_01',
        action: 'AUTHORIZE_DELIVERY',
        targetId: del.id,
        details: `Checker authorized delivery endpoint: ${del.destinationTarget}`
      }, ...logs]);
      this.loadData();
    });
  }

  openRejectModal(type: 'SCHEDULE' | 'DELIVERY', id: string) {
    this.targetRejectType.set(type);
    this.targetRejectId.set(id);
    this.rejectionReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
  }

  confirmReject() {
    const id = this.targetRejectId();
    const reason = this.rejectionReason;

    if (this.targetRejectType() === 'SCHEDULE') {
      this.reportService.rejectSchedule(id, reason).subscribe(() => {
        alert(`Schedule ${id} Rejected!\nReason: ${reason}`);
        this.auditLogs.update(logs => [{
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actorId: 'user_checker_01',
          action: 'REJECT_SCHEDULE',
          targetId: id,
          details: `Rejected with reason: ${reason}`
        }, ...logs]);
        this.closeRejectModal();
        this.loadData();
      });
    } else {
      this.deliveryService.rejectDeliveryOption(id, reason).subscribe(() => {
        alert(`Delivery Option ${id} Rejected!\nReason: ${reason}`);
        this.auditLogs.update(logs => [{
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actorId: 'user_checker_01',
          action: 'REJECT_DELIVERY',
          targetId: id,
          details: `Rejected with reason: ${reason}`
        }, ...logs]);
        this.closeRejectModal();
        this.loadData();
      });
    }
  }
}
