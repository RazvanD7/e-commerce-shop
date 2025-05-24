import { Component, Input, Self, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  imports: [CommonModule]
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() label = '';
  @ViewChild('input') inputElementRef: ElementRef;

  // Properties to hold the callback functions
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  writeValue(obj: any): void {
    // Update the input element's value when the form control's value changes
    if (this.inputElementRef) {
      this.inputElementRef.nativeElement.value = obj;
    } else {
        setTimeout(() => {
            if (this.inputElementRef) {
                this.inputElementRef.nativeElement.value = obj;
            }
        });
    }
  }
  registerOnChange(fn: any): void {
    // Store the callback function for value changes
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // Store the callback function for touch events (blur)
    this.onTouched = fn;
  }

  get control(): FormControl {
    return this.controlDir.control as FormControl
  }

}
