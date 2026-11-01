import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface LookupColumn {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-generic-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-lookup-modal.component.html',
  styleUrl: './generic-lookup-modal.component.scss'
})
export class GenericLookupModalComponent {
  @Input() title = 'Lookup';
  @Input() columns: LookupColumn[] = [];
  @Input() items: any[] = [];
  @Input() displayField = 'name';
  @Input() valueField = 'id';
  @Output() selectItem = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  searchQuery = '';
  selectedItem: any = null;

  get filteredItems(): any[] {
    if (!this.searchQuery.trim()) {
      return this.items;
    }
    const q = this.searchQuery.toLowerCase();
    return this.items.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(q)
      );
    });
  }

  onRowClick(item: any): void {
    this.selectedItem = item;
  }

  onRowDoubleClick(item: any): void {
    this.selectedItem = item;
    this.confirmSelection();
  }

  confirmSelection(): void {
    if (this.selectedItem) {
      this.selectItem.emit(this.selectedItem);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
