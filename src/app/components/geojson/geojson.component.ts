import { Component, OnInit, Input } from '@angular/core';
import {
  MatDialog, MatDialogRef, MatStepper,
  MatStep, MatStepLabel, MatStepperNext,
  MatStepperPrevious, MatRadioButton, MatRadioGroup,
  MatSelect, MatOption, MatInput
} from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit/services/startup/startup.service';
import { Filter, Aggregation } from 'arlas-api';
import { projType } from 'arlas-web-core';

@Component({
  selector: 'arlas-geojson',
  templateUrl: './geojson.component.html',
  styleUrls: ['./geojson.component.css']
})
export class GeojsonComponent {
  constructor(
    public dialog: MatDialog
  ) { }

  public openDialog() {
    this.dialog.open(GeojsonDialogComponent, { data: null });
  }

}

@Component({
  selector: 'arlas-geojson-dialog',
  templateUrl: './geojson-dialog.component.html',
  styleUrls: ['./geojson-dialog.component.css']
})
export class GeojsonDialogComponent implements OnInit {
  displayedUrl: string;
  precisions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  aggType = '_geoaggregate';
  geojsonTypeGroup: FormGroup;
  secondFormGroup: FormGroup;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<GeojsonDialogComponent>,
    private collaborativeService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService
  ) { }

  public ngOnInit() {
    this.geojsonTypeGroup = this._formBuilder.group({
      geojsonType: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      precision: ['', Validators.required]
    });
  }

  public changeStep(event) {
    if (event.selectedIndex === 2) {
      const filters = new Array<Filter>();
      this.collaborativeService.collaborations.forEach(element =>
        filters.push(element.filter)
      );

      const agg: Aggregation = {
        type: Aggregation.TypeEnum.Geohash,
        field: 'location',
        interval: {
          value: this.secondFormGroup.get('precision').value
        }
      };
      const server = this.configService.getValue('arlas.server');
      this.displayedUrl = server.url + '/explore/' + server.collection.name + '/'
      + this.aggType + '/?' + this.collaborativeService.getUrl([projType.geoaggregate, [agg]], filters);
    }
  }
}
