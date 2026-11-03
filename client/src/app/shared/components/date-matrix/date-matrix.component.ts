import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="citi-date-matrix-container">
      <div class="matrix-radios">
        <label class="radio-label" [class.selected]="selectedOption === 'YESTERDAY'">
          <input type="radio" [(ngModel)]="selectedOption" value="YESTERDAY" (change)="onOptionChange()" name="dateOption" />
          <span>Yesterday (T-1)</span>
        </label>

        <label class="radio-label" [class.selected]="selectedOption === 'LAST_7_DAYS'">
          <input type="radio" [(ngModel)]="selectedOption" value="LAST_7_DAYS" (change)="onOptionChange()" name="dateOption" />
          <span>Last 7 Days</span>
        </label>

        <label class="radio-label" [class.selected]="selectedOption === 'CURRENT_MONTH'">
          <input type="radio" [(ngModel)]="selectedOption" value="CURRENT_MONTH" (change)="onOptionChange()" name="dateOption" />
          <span>Current Month (MTD)</span>
        </label>

        <label class="radio-label" [class.selected]="selectedOption === 'PREVIOUS_MONTH'">
          <input type="radio" [(ngModel)]="selectedOption" value="PREVIOUS_MONTH" (change)="onOptionChange()" name="dateOption" />
          <span>Previous Month</span>
        </label>

        <label class="radio-label" [class.selected]="selectedOption === 'CUSTOM'">
          <input type="radio" [(ngModel)]="selectedOption" value="CUSTOM" (change)="onOptionChange()" name="dateOption" />
          <span>Custom Date Range</span>
        </label>
      </div>

      @if (selectedOption === 'CUSTOM') {
        <div class="custom-range-inputs">
          <div class="date-input-group">
            <span class="range-label">From:</span>
            <input type="date" [(ngModel)]="startDate" (change)="onDateChange()" class="range-input" />
          </div>
          <div class="date-input-group">
            <span class="range-label">To:</span>
            <input type="date" [(ngModel)]="endDate" (change)="onDateChange()" class="range-input" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-date-matrix-container {
      background-color: #FFFFFF;
      border: 1px solid $citi-border-input;
      border-radius: 2px;
      padding: 10px;

      .matrix-radios {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: $citi-text-primary;
          cursor: pointer;

          input[type="radio"] {
            accent-color: $citi-core-blue;
            cursor: pointer;
          }

          &.selected {
            font-weight: 600;
            color: $citi-core-blue;
          }
        }
      }

      .custom-range-inputs {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed $citi-border-subtle;
        display: flex;
        gap: 12px;

        .date-input-group {
          display: flex;
          align-items: center;
          gap: 6px;

          .range-label {
            font-size: 11px;
            font-weight: 600;
            color: $citi-text-secondary;
          }

          .range-input {
            height: 24px;
            font-size: 11px;
            padding: 0 4px;
            border: 1px solid $citi-border-input;
            border-radius: 2px;
          }
        }
      }
    }
  `]
})
export class DateMatrixComponent {
  @Input() selectedOption: string = 'YESTERDAY';
  @Input() startDate: string = '2026-03-31';
  @Input() endDate: string = '2026-03-31';

  @Output() optionChanged = new EventEmitter<string>();
  @Output() rangeChanged = new EventEmitter<{ startDate: string; endDate: string }>();

  onOptionChange() {
    this.optionChanged.emit(this.selectedOption);
  }

  onDateChange() {
    this.rangeChanged.emit({ startDate: this.startDate, endDate: this.endDate });
  }
}
