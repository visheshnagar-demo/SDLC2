import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../../core/services/lookup.service';
import { BaseReport } from '../../../../core/models/report.models';

@Component({
  selector: 'app-report-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-lookup-modal.component.html',
  styleUrl: './report-lookup-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportLookupModalComponent implements OnInit {
  private lookupService = inject(LookupService);

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() templateSelected = new EventEmitter<BaseReport>();

  templates = signal<BaseReport[]>([]);
  filteredTemplates = signal<BaseReport[]>([]);
  selectedTemplate = signal<BaseReport | null>(null);

  searchCode = signal<string>('CASH_STMT_EOD');
  searchName = signal<string>('End of Day Consolidated');
  selectedCategory = signal<string>('All Categories');
  searchBranch = signal<string>('NYC-001');

  ngOnInit(): void {
    this.lookupService.getReportNames().subscribe(data => {
      this.templates.set(data);
      this.filteredTemplates.set(data);
      if (data.length > 0) {
        this.selectedTemplate.set(data[0]);
      }
    });
  }

  onSelectRadio(template: BaseReport): void {
    this.selectedTemplate.set(template);
  }

  applyFilters(): void {
    const list = this.templates().filter(t => {
      const matchCode = !this.searchCode() || t.reportCode.toLowerCase().includes(this.searchCode().toLowerCase());
      const matchName = !this.searchName() || t.name.toLowerCase().includes(this.searchName().toLowerCase());
      const matchCat = this.selectedCategory() === 'All Categories' || t.category === this.selectedCategory();
      return matchCode && matchName && matchCat;
    });
    this.filteredTemplates.set(list);
  }

  resetFilters(): void {
    this.searchCode.set('');
    this.searchName.set('');
    this.selectedCategory.set('All Categories');
    this.searchBranch.set('');
    this.filteredTemplates.set(this.templates());
  }

  confirmSelection(): void {
    const current = this.selectedTemplate();
    if (current) {
      this.templateSelected.emit(current);
    }
    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }
}
