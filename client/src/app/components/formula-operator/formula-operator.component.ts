import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formula-operator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="formula-operator-wrapper">
      <button
        type="button"
        class="fx-btn"
        (click)="toggleMenu()"
        [title]="'Operator: ' + currentLabel()">
        <span class="fx-text">fx</span>
      </button>

      @if (isOpen()) {
        <div class="fx-menu">
          @for (op of operators; track op.value) {
            <div
              class="fx-menu-item"
              [class.active]="selectedOperator === op.value"
              (click)="selectOp(op.value)">
              <span class="check-mark">{{ selectedOperator === op.value ? '✔' : '' }}</span>
              <span>{{ op.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .formula-operator-wrapper {
      position: relative;
      display: inline-block;
    }

    .fx-btn {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #FAFAFA 0%, #E2E8F0 100%);
      border: 1px solid $citi-border-input;
      border-radius: $radius-default;
      font-family: $font-family-mono;
      font-size: 11px;
      font-weight: 700;
      color: $citi-blue;
      cursor: pointer;

      &:hover {
        background: $citi-surface-banner;
      }
    }

    .fx-text {
      font-style: italic;
    }

    .fx-menu {
      position: absolute;
      top: 30px;
      left: 0;
      z-index: 50;
      background: #FFFFFF;
      border: 1px solid $citi-border-input;
      border-radius: $radius-default;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      min-width: 120px;
      padding: 4px 0;
    }

    .fx-menu-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      font-size: 11px;
      cursor: pointer;

      &:hover {
        background-color: $citi-surface-banner;
      }

      &.active {
        font-weight: 600;
        color: $citi-blue;
      }
    }

    .check-mark {
      width: 12px;
      font-size: 10px;
      color: $citi-cyan-accent;
    }
  `]
})
export class FormulaOperatorComponent {
  @Input() selectedOperator: string = 'contains';
  @Output() operatorChange = new EventEmitter<string>();

  isOpen = signal<boolean>(false);

  operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' }
  ];

  currentLabel(): string {
    const found = this.operators.find(o => o.value === this.selectedOperator);
    return found ? found.label : 'Contains';
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  selectOp(val: string) {
    this.selectedOperator = val;
    this.operatorChange.emit(val);
    this.isOpen.set(false);
  }
}
