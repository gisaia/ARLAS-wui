import { Pipe, PipeTransform } from '@angular/core';
import { ConfigFormControl, ConfigFormGroup, FormGroupElement } from '../models/config-form';
import { FormArray } from '@angular/forms';

@Pipe({
  name: 'control'
})
export class ControlPipe implements PipeTransform {

  public transform(fg: ConfigFormGroup, controlName: string): FormGroupElement {
    return fg.controls[controlName];
  }

}
