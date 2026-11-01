import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-binocular-lookup-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BinocularLookupInputComponent),
      multi: true
    }
  ],
  templateUrl: './binocular-lookup-input.component.html',
  styleUrl: './binocular-lookup-input.component.scss'
})
export class BinocularLookupInputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() hasClear = false;
  @Input() inputWidth = '100%';
  @Output() lookupClick = new EventEmitter<void>();
  @Output() clearClick = new EventEmitter<void>();

  value = '';

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onTriggerLookup(): void {
    if (!this.disabled) {
      this.lookupClick.emit();
    }
  }

  onClear(): void {
    this.value = '';
    this.onChange('');
    this.clearClick.emit();
  }
}
