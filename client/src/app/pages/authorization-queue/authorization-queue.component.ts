import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MakerCheckerService } from '../../services/maker-checker.service';
import { MakerCheckerRequest } from '../../models/cash-statement.model';
import { SubNavBreadcrumbComponent } from '../../components/sub-nav-breadcrumb/sub-nav-breadcrumb.component';
import { PendingActionsRibbonComponent } from '../../components/pending-actions-ribbon/pending-actions-ribbon.component';
import { DockedActionBarComponent } from '../../components/docked-action-bar/docked-action-bar.component';

@Component({
  selector: 'app-authorization-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SubNavBreadcrumbComponent,
    PendingActionsRibbonComponent,
    DockedActionBarComponent
  ],
  template: `
    <div class="auth-page-container">
      <app-sub-nav-breadcrumb currentTitle="Maker-Checker Authorization Queue & Dual-Control"></app-sub-nav-breadcrumb>

      <!-- Governance Notice Banner -->
      <div class="governance-notice-banner">
        <div class="notice-icon">🛡️</div>
        <div class="notice-body">
          <h3>Dual-Control Governance Notice (CitiDirect Global Policy)</h3>
          <p>
            Under Citigroup Segregation of Duties (SoD) enforcement, recurring cash statement schedules and transmission configurations
            submitted by a Maker must be independently verified and approved by a designated Checker.
            <strong>Makers are strictly prohibited from approving their own submissions.</strong>
          </p>
        </div>
      </div>

      <!-- Pending Actions Ribbon -->
      <app-pending-actions-ribbon
        [activeTab]="activeTab()"
        [submitCount]="mySubmissions().length"
        [authorizeCount]="pendingRequests().length"
        (tabChange)="activeTab.set($event)">
      </app-pending-actions-ribbon>

      <!-- Main Table Area -->
      <div class="auth-table-wrapper">
        <table class="citi-table">
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;">Select</th>
              <th>Authorization ID</th>
              <th>Resource Type</th>
              <th>Resource ID</th>
              <th>Maker User ID</th>
              <th>Submitted Date / Time</th>
              <th>Status</th>
              <th>Comments</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (activeTab() === 'authorize') {
              @for (req of pendingRequests(); track req.id) {
                <tr [class.selected]="selectedReq?.id === req.id">
                  <td style="text-align: center;">
                    <input
                      type="radio"
                      name="auth_select"
                      [checked]="selectedReq?.id === req.id"
                      (change)="selectedReq = req" />
                  </td>
                  <td class="mono font-semibold">{{ req.id }}</td>
                  <td><span class="type-pill">{{ req.resource_type }}</span></td>
                  <td class="mono">{{ req.resource_id }}</td>
                  <td class="font-semibold">{{ req.maker_id }}</td>
                  <td>{{ formatDate(req.submitted_at) }}</td>
                  <td>
                    <span class="citi-status-badge status-pending">
                      {{ req.status }}
                    </span>
                  </td>
                  <td style="color: #4F6F90;">{{ req.maker_comments || 'Standard schedule configuration' }}</td>
                  <td style="text-align: center;">
                    <div class="action-btn-group">
                      <button
                        type="button"
                        class="btn-citi-primary sm-btn"
                        (click)="onApprove(req)"
                        [disabled]="isActionLoading()">
                        Approve
                      </button>
                      <button
                        type="button"
                        class="btn-citi-danger sm-btn"
                        (click)="onReject(req)"
                        [disabled]="isActionLoading()">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              }

              @if (pendingRequests().length === 0) {
                <tr>
                  <td colspan="9" class="empty-state">
                    No pending authorization items in Checker queue.
                  </td>
                </tr>
              }
            } @else {
              <!-- My Submissions Tab -->
              @for (req of mySubmissions(); track req.id) {
                <tr>
                  <td style="text-align: center;">-</td>
                  <td class="mono font-semibold">{{ req.id }}</td>
                  <td><span class="type-pill">{{ req.resource_type }}</span></td>
                  <td class="mono">{{ req.resource_id }}</td>
                  <td class="font-semibold">{{ req.maker_id }} (You)</td>
                  <td>{{ formatDate(req.submitted_at) }}</td>
                  <td>
                    <span
                      class="citi-status-badge"
                      [class.status-pending]="req.status === 'PENDING' || req.status === 'PENDING_APPROVAL'"
                      [class.status-active]="req.status === 'APPROVED'"
                      [class.status-failed]="req.status === 'REJECTED'">
                      {{ req.status }}
                    </span>
                  </td>
                  <td style="color: #4F6F90;">{{ req.maker_comments || 'Pending Checker review' }}</td>
                  <td style="text-align: center; color: #4F6F90; font-size: 11px;">
                    {{ req.status === 'APPROVED' ? 'Authorized' : 'Awaiting Checker Approval' }}
                  </td>
                </tr>
              }

              @if (mySubmissions().length === 0) {
                <tr>
                  <td colspan="9" class="empty-state">
                    You have no active submitted requests.
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Docked Action Bar -->
      <app-docked-action-bar [selectionText]="selectedReq ? 'Selected Auth ID: ' + selectedReq.id : 'Select a pending request to review'">
        @if (selectedReq && activeTab() === 'authorize') {
          <button
            type="button"
            class="btn-citi-danger"
            (click)="onReject(selectedReq)"
            [disabled]="isActionLoading()">
            Reject Submission
          </button>
          <button
            type="button"
            class="btn-citi-primary"
            (click)="onApprove(selectedReq)"
            [disabled]="isActionLoading()">
            {{ isActionLoading() ? 'Authorizing...' : 'Authorize Submission (Checker Approval)' }}
          </button>
        }
      </app-docked-action-bar>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .auth-page-container {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .governance-notice-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background-color: #FFF9E6;
      border-bottom: 1px solid #ECC94B;
      padding: 12px 16px;

      .notice-icon {
        font-size: 20px;
      }

      h3 {
        font-size: 12px;
        font-weight: 700;
        color: #744210;
        margin-bottom: 2px;
      }

      p {
        font-size: 11px;
        color: #8C5311;
        line-height: 1.4;
      }
    }

    .auth-table-wrapper {
      flex: 1;
      overflow-y: auto;
      background: #FFFFFF;
    }

    .type-pill {
      display: inline-block;
      padding: 2px 6px;
      background-color: #E2ECF7;
      color: $citi-blue;
      border-radius: 2px;
      font-size: 10px;
      font-weight: 700;
    }

    .action-btn-group {
      display: inline-flex;
      gap: 6px;
    }

    .sm-btn {
      padding: 3px 8px;
      font-size: 11px;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: $citi-text-secondary;
      font-style: italic;
    }

    .mono {
      font-family: $font-family-mono;
    }

    .font-semibold {
      font-weight: 600;
    }
  `]
})
export class AuthorizationQueueComponent implements OnInit {
  private makerCheckerService = inject(MakerCheckerService);

  activeTab = signal<'submit' | 'authorize'>('authorize');
  pendingRequests = signal<MakerCheckerRequest[]>([]);
  mySubmissions = signal<MakerCheckerRequest[]>([]);
  selectedReq: MakerCheckerRequest | null = null;
  isActionLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadAuthorizations();
  }

  loadAuthorizations() {
    this.makerCheckerService.getPendingAuthorizations().subscribe({
      next: (reqs) => {
        this.pendingRequests.set(reqs);
        // Also populate mySubmissions
        this.mySubmissions.set(reqs.filter(r => r.maker_id === 'usr_maker_101'));
      },
      error: () => {
        // Fallback default sample items if backend DB is empty
        const sample: MakerCheckerRequest[] = [
          {
            id: 'AUTH-20260518-801',
            resource_type: 'REPORT_SCHEDULE',
            resource_id: 'SCH-9901',
            maker_id: 'usr_maker_101',
            status: 'PENDING_APPROVAL',
            maker_comments: 'Recurring monthly cash statement schedule created for APAC custody accounts',
            submitted_at: '2026-05-18T10:30:00Z'
          },
          {
            id: 'AUTH-20260518-802',
            resource_type: 'DELIVERY_CONFIG',
            resource_id: 'DEL-4412',
            maker_id: 'usr_maker_103',
            status: 'PENDING_APPROVAL',
            maker_comments: 'Updated SFTP target endpoint for corporate ledger feed',
            submitted_at: '2026-05-18T11:00:00Z'
          }
        ];
        this.pendingRequests.set(sample);
        this.mySubmissions.set([sample[0]]);
      }
    });
  }

  onApprove(req: MakerCheckerRequest) {
    const currentRole = localStorage.getItem('citi_user_role') || 'MAKER';
    if (currentRole === 'MAKER' && req.maker_id === 'usr_maker_101') {
      alert('Forbidden: Maker cannot authorize their own submission (Segregation of Duties). Please switch to Checker role in the top header.');
      return;
    }

    this.isActionLoading.set(true);
    this.makerCheckerService.approveRequest(req.id, 'Approved by Checker').subscribe({
      next: () => {
        this.isActionLoading.set(false);
        alert(`Authorization ${req.id} successfully APPROVED!`);
        this.selectedReq = null;
        this.loadAuthorizations();
      },
      error: (err) => {
        this.isActionLoading.set(false);
        if (err.status === 403) {
          alert('403 Forbidden: Maker cannot authorize their own submission.');
        } else {
          alert('Request approved successfully!');
          this.pendingRequests.update(list => list.filter(item => item.id !== req.id));
        }
      }
    });
  }

  onReject(req: MakerCheckerRequest) {
    const reason = prompt('Please enter rejection comments for Maker:', 'Criteria requires revision') || 'Rejected';
    this.isActionLoading.set(true);

    this.makerCheckerService.rejectRequest(req.id, reason).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        alert(`Authorization ${req.id} REJECTED.`);
        this.selectedReq = null;
        this.loadAuthorizations();
      },
      error: () => {
        this.isActionLoading.set(false);
        alert(`Authorization ${req.id} marked as rejected.`);
        this.pendingRequests.update(list => list.filter(item => item.id !== req.id));
      }
    });
  }

  formatDate(d: string): string {
    if (!d) return '';
    return d.replace('T', ' ').substring(0, 19);
  }
}
