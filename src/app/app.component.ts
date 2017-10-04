import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor, HistogramContributor } from 'arlas-web-contributors';
import { MapglComponent, HistogramComponent } from 'arlas-web-components';
import { DateUnit, DataType, ChartType, Position } from 'arlas-web-components';


import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { Subject } from 'rxjs/Rx';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  public mapglcontributor: MapContributor;
  public timelinecontributor: HistogramContributor;

  public initCenter = [0, 0];
  public dateUnit = DateUnit;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;


  @ViewChild('timeline') private histogramComponent: HistogramComponent;
  @ViewChild(MapglComponent) private mapglComponent: MapglComponent;

  constructor(private http: Http,
    private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
  ) { }

  public ngAfterViewInit() {

   this.mapglComponent.map.showTileBoundaries = false;

 }
  public ngOnInit() {

    this.mapglcontributor = new MapContributor('mapbox',
      this.configService.getValue('catalog.web.app.fieldsConfiguration.idFieldName'),
      this.mapglComponent.onRemoveBbox,
      this.mapglComponent.drawType,
      this.collaborativeService,
      this.configService
    );

    this.timelinecontributor = new HistogramContributor('timeline',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService);
  }
}
