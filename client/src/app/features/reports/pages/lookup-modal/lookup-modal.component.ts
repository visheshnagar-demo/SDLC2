import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../../core/services/lookup.service';
import { LookupItem } from '../../../../core/models/report.models';

@Component({
  selector: 'app-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="citi-modal-overlay" (click)="close()">
      <div class="citi-modal-card" (click)="$event.stopPropagation()">
        <header class="citi-modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" (click)="close()" title="Close">&times;</button>
        </header>

        <div class="citi-search-banner" (click)="toggleSearchCriteria()">
          <span class="chevron">{{ showCriteria() ? '&#9660;' : '&#9658;' }}</span>
          <span>Search &amp; Filter Criteria</span>
        </div>

        @if (showCriteria()) {
          <div class="citi-search-box">
            <div class="search-field-row">
              <label>Search Keyword / Code:</label>
              <div class="input-with-fx">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  (ngModelChange)="onSearchChange()"
                  placeholder="Type code, description, or entity name..." 
                  class="search-input" />
                <button class="fx-indicator" title="Filter Operator: Contains"><em>fx</em></button>
              </div>
            </div>
          </div>
        }

        <div class="citi-modal-body">
          <div class="results-count">Displaying {{ filteredItems().length }} entitled records</div>
          
          <div class="citi-table-container modal-table">
            <table class="citi-data-table">
              <thead>
                <tr>
                  @if (type === 'REPORT_NAMES') {
                    <th>Report Code</th>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Module</th>
                    <th>Action</th>
                  } @else if (type === 'BRANCHES') {
                    <th>Branch Code</th>
                    <th>Branch Name</th>
                    <th>Description</th>
                    <th>Action</th>
                  } @else if (type === 'CUSTOMERS') {
                    <th>Customer ID</th>
                    <th>Corporate Entity Name</th>
                    <th>Classification</th>
                    <th>Action</th>
                  } @else if (type === 'ACCOUNTS') {
                    <th>Account Number</th>
                    <th>Currency</th>
                    <th>Account Title</th>
                    <th>Branch</th>
                    <th>Action</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (item of filteredItems(); track item.id) {
                  <tr (dblclick)="selectItem(item)">
                    @if (type === 'REPORT_NAMES') {
                      <td><strong>{{ item.code }}</strong></td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.category }}</td>
                      <td>{{ item.module }}</td>
                    } @else if (type === 'BRANCHES') {
                      <td><strong>{{ item.code }}</strong></td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.description }}</td>
                    } @else if (type === 'CUSTOMERS') {
                      <td><strong>{{ item.customerId }}</strong></td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.description }}</td>
                    } @else if (type === 'ACCOUNTS') {
                      <td><strong>{{ item.accountNumber }}</strong></td>
                      <td>{{ item.currency }}</td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.branchCode }}</td>
                    }
                    <td>
                      <button class="citi-btn-primary select-btn" (click)="selectItem(item)">Select</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">No matching master records found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <footer class="citi-modal-footer">
          <button class="citi-btn-secondary" (click)="close()">Cancel</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(34, 48, 62, 0.65);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .citi-modal-card {
      width: 760px;
      max-width: 90vw;
      max-height: 85vh;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 4px;
      box-shadow: 0 12px 32px rgba(13, 30, 59, 0.35);
      display: flex;
      flex-direction: column;
    }

    .citi-modal-header {
      height: 40px;
      background-color: $citi-dark-midnight;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-radius: 3px 3px 0 0;

      h3 {
        color: #FFFFFF;
        font-size: 13px;
        font-weight: 700;
      }

      .close-btn {
        background: none;
        border: none;
        color: #FFFFFF;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;

        &:hover {
          color: $citi-sky-action-top;
        }
      }
    }

    .citi-search-banner {
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-subtle;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 700;
      color: $citi-core-blue;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background-color: lighten($citi-surface-banner, 2%);
      }
    }

    .citi-search-box {
      padding: 12px 16px;
      background-color: #FAFBFD;
      border-bottom: 1px solid $citi-border-subtle;

      .search-field-row {
        display: flex;
        align-items: center;
        gap: 12px;

        label {
          font-size: 12px;
          font-weight: 600;
          color: $citi-text-primary;
        }

        .input-with-fx {
          flex: 1;
          display: flex;
          align-items: center;

          .search-input {
            flex: 1;
            height: 28px;
            padding: 0 8px;
            border: 1px solid $citi-border-input;
            border-right: none;
            border-radius: 2px 0 0 2px;
            outline: none;
            font-size: 12px;
          }

          .fx-indicator {
            width: 28px;
            height: 28px;
            background: linear-gradient(180deg, #FFFFFF 0%, #DCE6F0 100%);
            border: 1px solid $citi-border-input;
            border-radius: 0 2px 2px 0;
            color: $citi-core-blue;
            font-weight: 700;
            cursor: pointer;
          }
        }
      }
    }

    .citi-modal-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;

      .results-count {
        font-size: 11px;
        color: $citi-text-secondary;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .modal-table {
        max-height: 320px;
      }

      .select-btn {
        height: 22px;
        padding: 0 10px;
        font-size: 11px;
      }

      .empty-state {
        text-align: center;
        padding: 24px;
        color: $citi-text-secondary;
      }
    }

    .citi-modal-footer {
      padding: 10px 16px;
      background-color: $citi-surface-canvas;
      border-top: 1px solid $citi-border-subtle;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class LookupModalComponent implements OnInit {
  @Input() type: 'REPORT_NAMES' | 'BRANCHES' | 'CUSTOMERS' | 'ACCOUNTS' = 'REPORT_NAMES';
  @Input() modalTitle: string = 'Master Data Lookup Selection';
  @Input() branchCode?: string;
  @Input() customerId?: string;

  @Output() itemSelected = new EventEmitter<LookupItem>();
  @Output() dismissed = new EventEmitter<void>();

  private lookupService = inject(LookupService);

  showCriteria = signal(true);
  searchQuery = '';
  items = signal<LookupItem[]>([]);
  filteredItems = signal<LookupItem[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.type === 'REPORT_NAMES') {
      this.lookupService.getReportNames(this.searchQuery).subscribe(res => this.updateList(res));
    } else if (this.type === 'BRANCHES') {
      this.lookupService.getBranches(this.searchQuery).subscribe(res => this.updateList(res));
    } else if (this.type === 'CUSTOMERS') {
      this.lookupService.getCustomers(this.searchQuery).subscribe(res => this.updateList(res));
    } else if (this.type === 'ACCOUNTS') {
      this.lookupService.getAccounts(this.branchCode, this.customerId).subscribe(res => this.updateList(res));
    }
  }

  updateList(data: LookupItem[]) {
    this.items.set(data);
    this.filteredItems.set(data);
  }

  onSearchChange() {
    const q = this.searchQuery.toLowerCase();
    const all = this.items();
    if (!q) {
      this.filteredItems.set(all);
      return;
    }
    this.filteredItems.set(
      all.filter(i => 
        (i.code && i.code.toLowerCase().includes(q)) ||
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.customerId && i.customerId.toLowerCase().includes(q)) ||
        (i.accountNumber && i.accountNumber.toLowerCase().includes(q))
      )
    );
  }

  toggleSearchCriteria() {
    this.showCriteria.update(v => !v);
  }

  selectItem(item: LookupItem) {
    this.itemSelected.emit(item);
  }

  close() {
    this.dismissed.emit();
  }
}
