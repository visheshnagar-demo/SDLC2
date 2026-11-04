import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-binocular-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="binocular-input-group">
      <input
        type="text"
        class="citi-input compound-input"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [readonly]="readonly" />
      <button
        type="button"
        class="binocular-btn"
        (click)="openModal.emit()"
        [title]="'Lookup ' + label">
        <span class="binoculars-icon">🔍</span>
      </button>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .binocular-input-group {
      display: inline-flex;
      align-items: center;
      width: 100%;
    }

    .compound-input {
      flex: 1;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }

    .binocular-btn {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #F0F4F8 0%, #D2DEEC 100%);
      border: 1px solid $citi-border-input;
      border-top-right-radius: $radius-default;
      border-bottom-right-radius: $radius-default;
      cursor: pointer;
      padding: 0;
      transition: background 0.15s ease;

      &:hover {
        background: linear-gradient(180deg, #E2ECF7 0%, #BACEE4 100%);
      }

      &:active {
        background: #BACEE4;
      }
    }

    .binoculars-icon {
      font-size: 13px;
      filter: grayscale(1);
    }
  `]
})
export class BinocularLookupComponent {
  @Input() label: string = 'Lookup';
  @Input() placeholder: string = 'Select item...';
  @Input() value: string = '';
  @Input() readonly: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() openModal = new EventEmitter<void>();

  onValueChange(newVal: string) {
    this.valueChange.emit(newVal);
  }
}
