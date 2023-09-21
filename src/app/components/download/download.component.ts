import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DownloadService } from 'app/services/download.service';
import { DownloadInput, DownloadSettings, DownloadSettingsInputs } from 'app/tools/download.interface';

@Component({
  selector: 'arlas-download-product',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class DownloadComponent implements OnInit {
  public formGroup: FormGroup = new FormGroup({});
  public controlsName: string[] = [];
  public inputs: DownloadInput[] = [];
  public downloadSettings: DownloadSettings = {};
  public formInputs: DownloadSettingsInputs = {};
  public nbProducts = 0;

  public tooltipDelay = 2000;

  public constructor(
    private downloadService: DownloadService,
    private dialog: MatDialogRef<DownloadComponent>
  ) { }

  public ngOnInit(): void {
    const group: any = {};
    this.downloadSettings = this.downloadService.getDownloadSettings();
    this.formInputs = this.downloadSettings.inputs;
    Object.keys(this.formInputs).forEach(inputKey => {
      if (!!this.formInputs[inputKey].schema.enum) {
        this.formInputs[inputKey].schema.type = 'enum';
      }
      if (this.formInputs[inputKey].schema.type === 'array') {
        this.formInputs[inputKey].schema.items.type = 'enum';
      }
      group[inputKey] = this.getControl(this.formInputs[inputKey].schema);
      this.inputs.push(this.formInputs[inputKey]);
      this.controlsName.push(inputKey);
    });
    this.formGroup = new FormGroup(group);
  }

  public submit() {
    this.dialog.close({ payload: this.formGroup.value });
  }

  private getControl(input): AbstractControl {
    let defaultValue = '';
    if (!!input.default) {
      defaultValue = input.default;
    }
    return !!input.required ? new FormControl(defaultValue || '', Validators.required)
      : new FormControl(defaultValue || '');
  }
}
