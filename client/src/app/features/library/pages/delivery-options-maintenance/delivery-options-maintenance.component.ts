import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DeliveryOption, DeliveryOptionRequest, AuthorizationRequest } from '../../../../core/models/delivery.models';
import { UserProfile } from '../../../../core/models/entitlement.models';
import { MakerCheckerPanelComponent } from '../../components/maker-checker-panel/maker-checker-panel.component';

@Component({
  selector: 'app-delivery-options-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MakerCheckerPanelComponent],
  templateUrl: './delivery-options-maintenance.component.html',
  styleUrl: './delivery-options-maintenance.component.scss'
})
export class DeliveryOptionsMaintenanceComponent implements OnInit {
  activeTab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE' = 'ALL';
  deliveryOptions: DeliveryOption[] = [];
  selectedOptionId: string | null = null;
  currentUser!: UserProfile;

  // Counters
  countAll = 0;
  countToSubmit = 0;
  countToAuthorize = 0;

  // Create/Edit Modal
  showCreateModal = false;
  createForm!: FormGroup;

  // Authorize / Maker-Checker Modal
  showAuthorizeModal = false;
  optionToAuthorize: DeliveryOption | null = null;

  // Status message
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private deliveryService: DeliveryOptionsService,
    private lookupService: LookupService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.lookupService.getCurrentUser().subscribe(u => this.currentUser = u);
    this.initCreateForm();
    this.loadData();
  }

  initCreateForm(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      description: ['', Validators.required],
      deliveryType: ['E-Mail', Validators.required],
      securityMethod: ['Citi Secure E-Mail', Validators.required],
      emailRecipients: ['', [Validators.required]],
      emailSubject: ['', Validators.required],
      emailMessage: [''],
      fileName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_\-\.]+$/)]]
    });
  }

  loadData(): void {
    this.deliveryService.getDeliveryOptions(this.activeTab).subscribe({
      next: (options) => {
        this.deliveryOptions = options;
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'Failed to load delivery options.';
        this.statusType = 'error';
      }
    });

    this.deliveryService.getTabCounts().subscribe({
      next: (counts) => {
        this.countAll = counts.all || 0;
        this.countToAuthorize = counts.toAuthorize || 0;
        this.countToSubmit = counts.toSubmit || 0;
      },
      error: () => {
        // compute from loaded options if count endpoint fails
        this.countAll = this.deliveryOptions.length;
      }
    });
  }

  get displayedOptions(): DeliveryOption[] {
    return this.deliveryOptions;
  }

  selectTab(tab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE'): void {
    this.activeTab = tab;
    this.selectedOptionId = null;
    this.loadData();
  }

  onSelectRow(opt: DeliveryOption): void {
    this.selectedOptionId = opt.id;
  }

  get selectedOption(): DeliveryOption | undefined {
    return this.deliveryOptions.find(d => d.id === this.selectedOptionId);
  }

  openCreateModal(): void {
    this.createForm.reset({
      deliveryType: 'E-Mail',
      securityMethod: 'Citi Secure E-Mail',
      fileName: 'Account_Statement_Report.pdf'
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload: DeliveryOptionRequest = this.createForm.value;
    this.deliveryService.createDeliveryOption(payload).subscribe({
      next: (created) => {
        this.statusMessage = `Delivery Option '${created.name}' created. Level 1 Authorization Required.`;
        this.statusType = 'success';
        this.closeCreateModal();
        this.loadData();
        setTimeout(() => this.statusMessage = '', 5000);
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'Failed to create delivery option.';
        this.statusType = 'error';
      }
    });
  }

  openAuthorizePanel(opt: DeliveryOption): void {
    this.optionToAuthorize = opt;
    this.showAuthorizeModal = true;
  }

  onAuthorizeAction(actionReq: AuthorizationRequest): void {
    if (!this.optionToAuthorize) return;

    this.deliveryService.authorizeDeliveryOption(this.optionToAuthorize.id, actionReq).subscribe({
      next: (res) => {
        this.statusMessage = `Delivery option '${res.name}' status updated to ${res.authStatus}.`;
        this.statusType = 'success';
        this.showAuthorizeModal = false;
        this.optionToAuthorize = null;
        this.loadData();
        setTimeout(() => this.statusMessage = '', 5000);
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'Failed to authorize delivery option. Check segregation of duties.';
        this.statusType = 'error';
      }
    });
  }

  onTestConnectivity(opt: DeliveryOption): void {
    this.deliveryService.testConnectivity(opt.id).subscribe({
      next: (res) => {
        this.statusMessage = res.message || 'SMTP Host connection test successful.';
        this.statusType = 'success';
        setTimeout(() => this.statusMessage = '', 5000);
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'SMTP Host connectivity test failed.';
        this.statusType = 'error';
      }
    });
  }

  onDelete(opt: DeliveryOption): void {
    if (confirm(`Are you sure you want to delete delivery option '${opt.name}'?`)) {
      this.deliveryService.deleteDeliveryOption(opt.id).subscribe({
        next: () => {
          this.statusMessage = `Delivery Option '${opt.name}' deleted.`;
          this.statusType = 'info';
          this.loadData();
        },
        error: (err) => {
          this.statusMessage = err.error?.message || 'Failed to delete delivery option.';
          this.statusType = 'error';
        }
      });
    }
  }

  printLibrary(): void {
    window.print();
  }
}
