import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-binocular-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="citi-binocular-compound">
      <input 
        type="text" 
        [formControl]="control" 
        [placeholder]="placeholder" 
        [readonly]="readonly"
        class="compound-input" />
      
      <button 
        type="button" 
        class="binocular-btn" 
        (click)="openModal()" 
        title="Open master lookup selection">
        &#128065;
      </button>

      @if (showFx) {
        <button 
          type="button" 
          class="fx-btn" 
          (click)="toggleFxDropdown()" 
          title="Formula Filter Criteria Operator">
          <em>fx</em>
        </button>

        @if (isFxOpen()) {
          <div class="fx-dropdown" (click)="$event.stopPropagation()">
            <div class="fx-item" (click)="setFx('equals')">Equals</div>
            <div class="fx-item selected" (click)="setFx('contains')">&#10004; Contains</div>
            <div class="fx-item" (click)="setFx('startsWith')">Starts With</div>
            <div class="fx-item" (click)="setFx('inList')">In Entitled List</div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-binocular-compound {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      .compound-input {
        flex: 1;
        height: $citi-input-height;
        padding: 0 8px;
        font-family: $citi-font-family;
        font-size: 12px;
        color: $citi-text-primary;
        border: 1px solid $citi-border-input;
        border-right: none;
        border-radius: 2px 0 0 2px;
        outline: none;

        &:focus {
          border-color: $citi-focus-blue;
        }

        &[readonly] {
          background-color: $citi-surface-disabled;
        }
      }

      .binocular-btn {
        width: 28px;
        height: $citi-input-height;
        background: linear-gradient(180deg, #FFFFFF 0%, #DCE6F0 100%);
        border: 1px solid $citi-border-input;
        border-radius: 0 2px 2px 0;
        color: $citi-core-blue;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: linear-gradient(180deg, #FFFFFF 0%, #C8D8E8 100%);
          border-color: darken($citi-border-input, 10%);
        }
      }

      .fx-btn {
        width: 26px;
        height: $citi-input-height;
        margin-left: 4px;
        background: linear-gradient(180deg, #FFFFFF 0%, #E9EEF3 100%);
        border: 1px solid $citi-border-input;
        border-radius: 2px;
        color: $citi-core-blue;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: #DCECF8;
        }
      }

      .fx-dropdown {
        position: absolute;
        top: 30px;
        right: 0;
        width: 130px;
        background: #FFFFFF;
        border: 1px solid $citi-border-grid;
        border-radius: 2px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 50;

        .fx-item {
          padding: 6px 10px;
          font-size: 11px;
          cursor: pointer;

          &:hover {
            background-color: $citi-surface-banner;
            color: $citi-text-link-blue;
          }

          &.selected {
            font-weight: 700;
            color: $citi-core-blue;
          }
        }
      }
    }
  `]
})
export class BinocularLookupComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() placeholder: string = 'Select...';
  @Input() readonly: boolean = false;
  @Input() showFx: boolean = false;
  @Output() lookupClicked = new EventEmitter<void>();

  isFxOpen = signal(false);
  operator = signal('contains');

  openModal() {
    this.lookupClicked.emit();
  }

  toggleFxDropdown() {
    this.isFxOpen.update(v => !v);
  }

  setFx(op: string) {
    this.operator.set(op);
    this.isFxOpen.set(false);
  }
}
