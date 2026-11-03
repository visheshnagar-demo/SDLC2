import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { DeliveryOption } from '../../../../core/models/report.models';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { PendingRibbonComponent } from '../../../../shared/components/pending-ribbon/pending-ribbon.component';

@Component({
  selector: 'app-delivery-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, PendingRibbonComponent],
  template: `
    <div class="delivery-options-page">
      <app-breadcrumb currentSection="Delivery Options Management"></app-breadcrumb>

      <!-- Banner Header -->
      <section class="citi-banner-header">
        <div class="banner-title">
          <h2>Delivery Options &amp; Channel Endpoints Maintenance</h2>
          <p class="banner-subtext">Manage automated statement dispatch channels: SFTP, Secured Email, Cloud Vaults, and CitiDirect Document Portal.</p>
        </div>
        <div class="banner-actions">
          <button class="citi-btn-primary" (click)="toggleNewOptionForm()">
            {{ showNewForm() ? 'Hide Config Form' : '+ Configure New Channel' }}
          </button>
        </div>
      </section>

      <!-- Pending Actions Ribbon -->
      <app-pending-ribbon
        [totalCount]="deliveryOptions().length"
        [pendingCount]="pendingCount()"
        [rejectedCount]="rejectedCount()"
        [selectedTab]="activeTab()"
        (tabChanged)="onRibbonTabChange($event)">
      </app-pending-ribbon>

      <!-- New Option Config Form -->
      @if (showNewForm()) {
        <div class="citi-form-card">
          <h3 class="form-title">Configure Delivery Endpoint Profile</h3>
          
          <form [formGroup]="deliveryForm" (ngSubmit)="onCreateDeliveryOption()">
            <div class="form-grid-3col">
              
              <div class="citi-form-group">
                <label>Channel Protocol / Type <span class="required">*</span></label>
                <select formControlName="channelType">
                  <option value="SFTP">SFTP (SSH File Transfer Protocol)</option>
                  <option value="EMAIL">Encrypted Email Dispatch</option>
                  <option value="PORTAL">CitiDirect In-Portal Document Vault</option>
                  <option value="VAULT">Cloud Secured Archive (S3 / GCP / Azure)</option>
                </select>
              </div>

              <div class="citi-form-group">
                <label>Destination Target / Host Endpoint <span class="required">*</span></label>
                <input type="text" formControlName="destinationTarget" placeholder="e.g. sftp.treasury.corp.com or ops@acme.com" />
              </div>

              <div class="citi-form-group">
                <label>Remote Folder Destination Path</label>
                <input type="text" formControlName="sftpFolderPath" placeholder="/incoming/statements/citi/" />
              </div>

              <div class="citi-form-group">
                <label>Encryption &amp; Security Protocol</label>
                <select formControlName="encryptionProtocol">
                  <option value="PGP_ENCRYPTED_AES256">PGP Encryption (AES-256)</option>
                  <option value="TLS_1_3_STRICT">Strict TLS 1.3 Transmission</option>
                  <option value="AWS_KMS_CUSTOMER_KEY">Cloud Customer Managed Key (CMK)</option>
                </select>
              </div>

              <div class="citi-form-group">
                <label>Authentication &amp; SSH Key Method</label>
                <select formControlName="sshKeyMethod">
                  <option value="RSA_4096_ED25519">SSH Key Pair (RSA 4096 / ED25519)</option>
                  <option value="MUTUAL_TLS_CERT">Mutual TLS Client Certificate (mTLS)</option>
                  <option value="DUAL_FACTOR_SERVICE_ACC">Service Account Token + Key</option>
                </select>
              </div>

            </div>

            <div class="form-actions-dock">
              <span class="info-text">Submitting enters PENDING_AUTHORIZATION state for Checker review.</span>
              <div class="btn-group">
                <button type="button" class="citi-btn-secondary" (click)="toggleNewForm()">Cancel</button>
                <button type="submit" class="citi-btn-primary" [disabled]="deliveryForm.invalid">Save Channel Profile</button>
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Delivery Options Table -->
      <div class="table-section">
        <div class="citi-table-container">
          <table class="citi-data-table">
            <thead>
              <tr>
                <th>Delivery Option ID</th>
                <th>Channel Type</th>
                <th>Destination Endpoint / Target</th>
                <th>Remote Folder Path</th>
                <th>Encryption Protocol</th>
                <th>Maker ID</th>
                <th>Status</th>
                <th>Dual-Control Checker</th>
              </tr>
            </thead>
            <tbody>
              @for (opt of filteredOptions(); track opt.id) {
                <tr>
                  <td><strong>{{ opt.id }}</strong></td>
                  <td>
                    <span class="channel-pill" [ngClass]="opt.channelType.toLowerCase()">
                      {{ opt.channelType }}
                    </span>
                  </td>
                  <td><code>{{ opt.destinationTarget }}</code></td>
                  <td>{{ opt.sftpFolderPath || 'N/A (Direct Delivery)' }}</td>
                  <td>{{ opt.encryptionProtocol || 'Default Secure Channel' }}</td>
                  <td><code>{{ opt.makerId }}</code></td>
                  <td>
                    <span class="citi-badge" [ngClass]="getStatusBadgeClass(opt.status)">
                      {{ opt.status }}
                    </span>
                  </td>
                  <td>{{ opt.checkerId || 'Pending Dual-Control Authorization' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-msg">No delivery channels registered under the active filter tab.</td>
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

    .delivery-options-page {
      padding-bottom: 40px;
    }

    .citi-banner-header {
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-subtle;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .banner-title {
        h2 {
          font-size: 15px;
          font-weight: 700;
          color: $citi-core-blue;
        }

        .banner-subtext {
          font-size: 11px;
          color: $citi-text-secondary;
          margin-top: 2px;
        }
      }
    }

    .citi-form-card {
      margin: 16px 20px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 2px;
      padding: 20px;

      .form-title {
        font-size: 13px;
        font-weight: 700;
        color: $citi-core-blue;
        padding-bottom: 6px;
        margin-bottom: 14px;
        border-bottom: 2px solid $citi-surface-table-head;
      }

      .form-grid-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .form-actions-dock {
        margin-top: 20px;
        padding-top: 14px;
        border-top: 1px solid $citi-border-subtle;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .info-text {
          font-size: 11px;
          color: $citi-text-secondary;
        }

        .btn-group {
          display: flex;
          gap: 8px;
        }
      }
    }

    .table-section {
      margin: 16px 20px;

      .channel-pill {
        display: inline-block;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        border-radius: 2px;
        text-transform: uppercase;

        &.sftp { background-color: #E1F0FF; color: #005AA1; }
        &.email { background-color: #E8F5E9; color: #2E7D32; }
        &.portal { background-color: #EDE7F6; color: #512DA8; }
        &.vault { background-color: #FFF3E0; color: #E65100; }
      }

      .empty-msg {
        text-align: center;
        padding: 24px;
        color: $citi-text-secondary;
      }
    }
  `]
})
export class DeliveryOptionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);

  deliveryOptions = signal<DeliveryOption[]>([]);
  showNewForm = signal(false);
  activeTab = signal('all');

  deliveryForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.deliveryForm = this.fb.group({
      channelType: ['SFTP', Validators.required],
      destinationTarget: ['sftp.treasury.corp.acme.com:22', Validators.required],
      sftpFolderPath: ['/incoming/statements/citi/'],
      encryptionProtocol: ['PGP_ENCRYPTED_AES256'],
      sshKeyMethod: ['RSA_4096_ED25519']
    });
  }

  loadData() {
    this.deliveryService.getDeliveryOptions().subscribe(res => this.deliveryOptions.set(res));
  }

  pendingCount(): number {
    return this.deliveryOptions().filter(d => d.status === 'PENDING_AUTHORIZATION').length;
  }

  rejectedCount(): number {
    return this.deliveryOptions().filter(d => d.status === 'REJECTED').length;
  }

  filteredOptions(): DeliveryOption[] {
    const tab = this.activeTab();
    if (tab === 'pending') {
      return this.deliveryOptions().filter(d => d.status === 'PENDING_AUTHORIZATION');
    }
    if (tab === 'rejected') {
      return this.deliveryOptions().filter(d => d.status === 'REJECTED');
    }
    return this.deliveryOptions();
  }

  onRibbonTabChange(tab: string) {
    this.activeTab.set(tab);
  }

  toggleNewOptionForm() {
    this.showNewForm.update(v => !v);
  }

  toggleNewForm() {
    this.showNewForm.set(false);
  }

  onCreateDeliveryOption() {
    if (this.deliveryForm.invalid) return;

    this.deliveryService.createDeliveryOption(this.deliveryForm.value).subscribe(newOpt => {
      alert(`Delivery Endpoint Created!\nID: ${newOpt.id}\nStatus: PENDING_AUTHORIZATION\nSent to Checker Authorization Queue.`);
      this.showNewForm.set(false);
      this.loadData();
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-active';
      case 'PENDING_AUTHORIZATION': return 'badge-pending';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }
}
