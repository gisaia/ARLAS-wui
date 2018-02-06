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
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Http } from '@angular/http';
import { ArlasSearchField } from 'app/components/geojson/model/field';

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
  precisions = [
    [1, '5,009.4km x 4,992.6km'],
    [2, '1,252.3km x 624.1km'],
    [3, '156.5km x 156km'],
    [4, '39.1km x 19.5km'],
    [5, '4.9km x 4.9km'],
    [6, '1.2km x 609.4m'],
    [7, '152.9m x 152.4m'],
    [8, '38.2m x 19m'],
    [9, '4.8m x 4.8m'],
    [10, '1.2m x 59.5cm'],
    [11, '14.9cm x 14.9cm'],
    [12, '3.7cm x 1.9cm']
  ];

  aggType: projType.geoaggregate | projType.geosearch;
  aggTypeText = '_geoaggregate';
  searchSize = '';
  includeFields = '';
  sort = '';

  isCopied = false;
  maxForCluster: number;
  maxForFeature: number;
  fields: Array<any>;

  geojsonTypeGroup: FormGroup;
  paramFormGroup: FormGroup;

  selectedFields = new Array<ArlasSearchField>();
  selectedOrderField: ArlasSearchField;
  sortDirection: string;

  allFields = new Array<ArlasSearchField>();
  excludedType = new Set<string>();
  excludedTypeString = '';

  constructor(
    private _formBuilder: FormBuilder,
    private http: Http,
    public dialogRef: MatDialogRef<GeojsonDialogComponent>,
    private collaborativeService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService
  ) { }

  public ngOnInit() {
    this.geojsonTypeGroup = this._formBuilder.group({
      geojsonType: ['', Validators.required]
    });
    this.paramFormGroup = this._formBuilder.group({
      precision: ['', Validators.required],
      availableFields: ['', Validators.required],
      orderField: [''],
      orderDirection: ['']
    });
    this.maxForCluster = this.configService.getValue('arlas-wui.web.app.components.geojson.max_for_cluster');
    this.maxForFeature = this.configService.getValue('arlas-wui.web.app.components.geojson.max_for_feature');
    this.configService.getValue('arlas-wui.web.app.components.geojson.excludedType').forEach(element => {
      this.excludedType.add(element);
      this.excludedTypeString += element + ', ';
    });
    this.excludedTypeString = this.excludedTypeString.substr(0, this.excludedTypeString.length - 2);
  }

  public changeStep(event) {
    const server = this.configService.getValue('arlas.server');

    if (event.selectedIndex === 1) {
      if (this.geojsonTypeGroup.get('geojsonType').value === 'feature') {
        this.paramFormGroup.get('precision').disable();
        this.paramFormGroup.get('availableFields').enable();
        this.aggTypeText = '_geosearch';
        this.aggType = projType.geosearch;
        this.searchSize = '&size=' + this.maxForFeature;
        this.http.get(server.url + '/explore/' + server.collection.name + '/_describe?pretty=false').map(
          response => {
            const json = response.json();
            this.fields = json.properties;
            Object.keys(json.properties).forEach(fieldName =>
              this.allFields.push({ label: fieldName, type: this.fields[fieldName].type })
            );
          }).subscribe(
          response => { },
          error => {
            this.collaborativeService.collaborationErrorBus.next(error);
          }
          );
      } else {
        this.paramFormGroup.get('precision').enable();
        this.paramFormGroup.get('availableFields').disable();
        this.aggTypeText = '_geoaggregate';
        this.aggType = projType.geoaggregate;
        this.searchSize = '&size=' + this.maxForCluster;
      }
    }
    if (event.selectedIndex === 2) {
      this.isCopied = false;
      const filters = new Array<Filter>();
      this.collaborativeService.collaborations.forEach(element =>
        filters.push(element.filter)
      );

      const agg: Aggregation = {
        type: Aggregation.TypeEnum.Geohash,
        field: 'location',
        interval: {
          value: this.paramFormGroup.get('precision').value
        }
      };
      if (this.geojsonTypeGroup.get('geojsonType').value === 'feature') {
        if (this.selectedFields.length > 0) {
          this.includeFields = '&include=';
          this.selectedFields.forEach(field =>
            this.includeFields += field.label + ','
          );
        }

        if (this.selectedOrderField) {
          this.sort = '&sort=' + (this.sortDirection === 'desc' ? '-' : '') + this.selectedOrderField.label;
        }
      }

      this.displayedUrl = server.url + '/explore/' + server.collection.name + '/'
        + this.aggTypeText + '/?' + this.collaborativeService.getUrl([this.aggType, [agg]], filters)
        + this.searchSize + this.includeFields + this.sort;
    }
  }

}
