import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportTemplate } from '../../models/cash-statement.model';

@Component({
  selector: 'app-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Base Report Template Lookup</span>
            <button type="button" class="close-btn" (click)="close.emit()">✕</button>
          </div>

          <div class="modal-search-bar">
            <input
              type="text"
              class="citi-input search-input"
              placeholder="Filter by report name or category..."
              [(ngModel)]="searchQuery" />
            <span class="results-count">{{ filteredTemplates().length }} templates available</span>
          </div>

          <div class="modal-table-container">
            <table class="citi-table">
              <thead>
                <tr>
                  <th style="width: 40px;">Select</th>
                  <th>Template ID</th>
                  <th>Report Name</th>
                  <th>Classification</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (tmpl of filteredTemplates(); track tmpl.template_id) {
                  <tr
                    [class.selected]="selectedTemplate?.template_id === tmpl.template_id"
                    (click)="selectedTemplate = tmpl">
                    <td style="text-align: center;">
                      <input
                        type="radio"
                        name="template_select"
                        [checked]="selectedTemplate?.template_id === tmpl.template_id" />
                    </td>
                    <td style="font-family: monospace; font-weight: 600;">{{ tmpl.template_id }}</td>
                    <td style="font-weight: 600; color: #002D72;">{{ tmpl.report_name }}</td>
                    <td><span class="citi-status-badge status-active">{{ tmpl.classification }}</span></td>
                    <td>{{ tmpl.category }}</td>
                    <td style="color: #4F6F90;">{{ tmpl.description }}</td>
                  </tr>
                }
                @if (filteredTemplates().length === 0) {
                  <tr>
                    <td colspan="6" class="empty-state">No matching report templates found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-citi-secondary" (click)="close.emit()">Cancel</button>
            <button
              type="button"
              class="btn-citi-primary"
              [disabled]="!selectedTemplate"
              (click)="confirmSelection()">
              Select Report Template
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @import 'styles/design-tokens';

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(15, 32, 61, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }

    .modal-card {
      width: 800px;
      max-width: 95vw;
      max-height: 85vh;
      background: #FFFFFF;
      border: 1px solid $citi-border-input;
      border-radius: $radius-card;
      box-shadow: 0 8px 24px rgba(0, 45, 114, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 42px;
      background-color: $citi-blue;
      color: #FFFFFF;
      padding: 0 16px;
    }

    .modal-title {
      font-size: 14px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: #FFFFFF;
      font-size: 16px;
      cursor: pointer;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }

    .modal-search-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-subtle;
    }

    .search-input {
      width: 320px;
    }

    .results-count {
      font-size: 11px;
      color: $citi-text-secondary;
    }

    .modal-table-container {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: $citi-text-secondary;
      font-style: italic;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 16px;
      background-color: #F0F4F8;
      border-top: 1px solid $citi-border-grid;
    }
  `]
})
export class LookupModalComponent {
  @Input() isOpen: boolean = false;
  @Input() templates: ReportTemplate[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() templateSelected = new EventEmitter<ReportTemplate>();

  searchQuery: string = '';
  selectedTemplate: ReportTemplate | null = null;

  filteredTemplates(): ReportTemplate[] {
    if (!this.searchQuery.trim()) {
      return this.templates;
    }
    const q = this.searchQuery.toLowerCase();
    return this.templates.filter(t =>
      t.report_name.toLowerCase().includes(q) ||
      t.template_id.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }

  confirmSelection() {
    if (this.selectedTemplate) {
      this.templateSelected.emit(this.selectedTemplate);
      this.close.emit();
    }
  }
}
