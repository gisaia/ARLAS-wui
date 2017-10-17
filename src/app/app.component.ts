import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor, HistogramContributor, ChipsSearchContributor } from 'arlas-web-contributors';
import { FieldsConfiguration, HistogramComponent, MapglComponent } from 'arlas-web-components';
import { DateUnit, DataType, ChartType, Position } from 'arlas-web-components';


import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { SearchComponent } from './components/search/search.component';
import { Subject } from 'rxjs/Rx';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public mapglcontributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelinecontributor: HistogramContributor;
  public cloudcoveragecontributor: HistogramContributor;
  public qualitycontributor: HistogramContributor;
  public azimutcontributor: HistogramContributor;
  public cloudcoverageFiltercontributor: HistogramContributor;
  public qualityFiltercontributor: HistogramContributor;
  public azimutFiltercontributor: HistogramContributor;

  public initCenter = [0, 0];
  public dateUnit = DateUnit;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public fieldsConfiguration: FieldsConfiguration;

  public isAnalyticsHovered = false;
  public isFilterMode = false;
  public analyticsWidth = 190;
  public analyticsModeWidth = 200;


  @ViewChild('timeline') private histogramComponent: HistogramComponent;
  @ViewChild(MapglComponent) private mapglComponent: MapglComponent;
  @ViewChild(SearchComponent) private searchComponent: SearchComponent;

  constructor(private http: Http,
    private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
  ) {
    this.fieldsConfiguration = this.configService.getValue('catalog.web.app.fieldsConfiguration');
  }

  public ngOnInit() {

    this.mapglcontributor = new MapContributor('mapbox',
      this.configService.getValue('catalog.web.app.fieldsConfiguration.idFieldName'),
      this.mapglComponent.onRemoveBbox,
      this.mapglComponent.drawType,
      this.collaborativeService,
      this.configService
    );

    this.chipsSearchContributor = new ChipsSearchContributor('chipssearch',
      this.searchComponent.sizeOnBackspaceBus,
      this.collaborativeService,
      this.configService
    );

    this.timelinecontributor = new HistogramContributor('timeline',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService);

    this.cloudcoveragecontributor = new HistogramContributor('cloud',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService
    );
    this.qualitycontributor = new HistogramContributor('quality',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService, true
    );
    this.azimutcontributor = new HistogramContributor('azimut',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService, true
    );

    this.cloudcoverageFiltercontributor = new HistogramContributor('cloudFilter',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService
    );
    this.qualityFiltercontributor = new HistogramContributor('qualityFilter',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService, true
    );
    this.azimutFiltercontributor = new HistogramContributor('azimutFilter',
      this.dateUnit.millisecond,
      this.collaborativeService,
      this.configService, true
    );
  }

  public showToggle() {
    this.isAnalyticsHovered = true;
  }

  public hideToggle() {
    this.isAnalyticsHovered = false;
  }

  public showAnalyticsAsFilters(event) {
    this.isFilterMode = true;
  }

  public showAnalyticsAsThumbnails(event) {
    this.isFilterMode = false;
  }

  public test(event) {
    this.qualityFiltercontributor.valueChanged(event);
    this.qualitycontributor.chartData = this.qualityFiltercontributor.chartData;
    this.qualitycontributor.intervalSelection = this.qualityFiltercontributor.intervalSelection;
  }
}
