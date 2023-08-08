import { Component, Input, OnInit } from '@angular/core';
import { ConfigFormControl } from 'app/arlas-wui-customiser/models/config-form';

@Component({
  selector: 'arlas-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss']
})
export class ConfigFormComponent implements OnInit {

  @Input() public form: ConfigFormControl;
  @Input() public formType: string;

  public constructor() { }

  public ngOnInit(): void {
  }

}
