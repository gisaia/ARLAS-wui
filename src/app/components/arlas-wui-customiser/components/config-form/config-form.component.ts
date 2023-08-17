import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FORM_TYPE, FormGroupElement } from 'app/components/arlas-wui-customiser/models/config-form';

@Component({
  selector: 'arlas-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss']
})
export class ConfigFormComponent implements OnInit {

  @Input() public form: FormGroupElement;
  public formType: string;

  public FORM_TYPE = FORM_TYPE;

  public constructor() { }

  public ngOnInit(): void {
    if (this.form instanceof FormArray) {
      this.formType = FORM_TYPE.ARRAY;
    } else {
      this.formType = this.form.formType;
    }
  }

}
