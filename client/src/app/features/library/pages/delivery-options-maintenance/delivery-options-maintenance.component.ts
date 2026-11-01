import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DeliveryOption, DeliveryOptionCreateRequest, MakerCheckerActionRequest } from '../../../../core/models/delivery.models';
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
      messageText: [''],
      fileName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_\-\.]+$/)]]
    });
  }

  loadData(): void {
    this.deliveryService.getDeliveryOptions('ALL').subscribe(all => {
      this.deliveryOptions = all;
      this.countAll = all.length;
      this.countToSubmit = all.filter(d => d.authStatus === 'PENDING_REPAIR').length;
      this.countToAuthorize = all.filter(d => d.authStatus === 'PENDING_AUTHORIZATION').length;
    });
  }

  get displayedOptions(): DeliveryOption[] {
    if (this.activeTab === 'TO_AUTHORIZE') {
      return this.deliveryOptions.filter(d => d.authStatus === 'PENDING_AUTHORIZATION');
    }
    if (this.activeTab === 'TO_SUBMIT') {
      return this.deliveryOptions.filter(d => d.authStatus === 'PENDING_REPAIR');
    }
    return this.deliveryOptions;
  }

  selectTab(tab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE'): void {
    this.activeTab = tab;
    this.selectedOptionId = null;
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

    const payload: DeliveryOptionCreateRequest = this.createForm.value;
    this.deliveryService.createDeliveryOption(payload).subscribe(created => {
      this.statusMessage = `Delivery Option '${created.name}' created. Level 1 Authorization Required.`;
      this.statusType = 'success';
      this.closeCreateModal();
      this.loadData();
      setTimeout(() => this.statusMessage = '', 5000);
    });
  }

  openAuthorizePanel(opt: DeliveryOption): void {
    this.optionToAuthorize = opt;
    this.showAuthorizeModal = true;
  }

  onAuthorizeAction(actionReq: MakerCheckerActionRequest): void {
    if (!this.optionToAuthorize) return;

    this.deliveryService.authorizeDeliveryOption(this.optionToAuthorize.id, actionReq).subscribe(res => {
      this.statusMessage = res.message;
      this.statusType = 'success';
      this.showAuthorizeModal = false;
      this.optionToAuthorize = null;
      this.loadData();
      setTimeout(() => this.statusMessage = '', 5000);
    });
  }

  onTestConnectivity(opt: DeliveryOption): void {
    this.deliveryService.testConnectivity(opt.id).subscribe(res => {
      this.statusMessage = res.message;
      this.statusType = 'success';
      setTimeout(() => this.statusMessage = '', 5000);
    });
  }

  onDelete(opt: DeliveryOption): void {
    if (confirm(`Are you sure you want to delete delivery option '${opt.name}'?`)) {
      this.deliveryService.deleteDeliveryOption(opt.id).subscribe(() => {
        this.statusMessage = `Delivery Option '${opt.name}' deleted.`;
        this.statusType = 'info';
        this.loadData();
      });
    }
  }

  printLibrary(): void {
    window.print();
  }
}
