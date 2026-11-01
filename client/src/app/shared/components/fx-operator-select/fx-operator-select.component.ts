import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fx-operator-select',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FxOperatorSelectComponent),
      multi: true
    }
  ],
  templateUrl: './fx-operator-select.component.html',
  styleUrl: './fx-operator-select.component.scss'
})
export class FxOperatorSelectComponent implements ControlValueAccessor {
  @Input() disabled = false;

  value = 'Equals';
  operators = ['Equals', 'Contains', 'Starts With', 'Ends With'];

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(val: string): void {
    this.value = val || 'Equals';
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

  onSelect(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
}
