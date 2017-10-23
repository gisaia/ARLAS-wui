import { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor, HistogramContributor, ChipsSearchContributor } from 'arlas-web-contributors';
import { FieldsConfiguration, HistogramComponent, MapglComponent } from 'arlas-web-components';
import { DateUnit, DataType, ChartType, Position, drawType } from 'arlas-web-components';


import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { Histogram } from './models/histogram';
import { ContributorService } from './services/contributors.service';

import { SearchComponent } from './components/search/search.component';
import { Subject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public mapglcontributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelinecontributor: HistogramContributor;

  public histograms: Array<Histogram>;
  public mapDrawType = drawType.RECTANGLE;
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
  public zoomToPrecisionCluster: Object;
  public maxPrecision: number;

  @ViewChild('timeline') private histogramComponent: HistogramComponent;
  @ViewChild(MapglComponent) private mapglComponent: MapglComponent;
  @ViewChild(SearchComponent) private searchComponent: SearchComponent;

  constructor(private http: Http,
    private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService,
    private contributorService: ContributorService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.zoomToPrecisionCluster = this.configService.getValue('catalog.web.app.components.map$mapbox.zoomToPrecisionCluster');
    this.maxPrecision = this.configService.getValue('catalog.web.app.components.map$mapbox.maxPrecision');
    this.fieldsConfiguration = this.configService.getValue('catalog.web.app.fieldsConfiguration');
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.collaborativeService.collaborationBus.subscribe(collaborationEvent => {
      queryParams['filter'] = this.collaborativeService.urlBuilder().split('=')[1];
      if (collaborationEvent.id !== 'url') {
        this.router.navigate(['.'], { queryParams: queryParams });
      }
    });

  }

  public ngOnInit() {

    this.mapglcontributor = new MapContributor('mapbox',
      this.configService.getValue('catalog.web.app.fieldsConfiguration.idFieldName'),
      this.mapglComponent.onRemoveBbox,
      this.mapglComponent.redrawTile,
      this.mapDrawType,
      this.collaborativeService,
      this.configService
    );
    this.chipsSearchContributor = new ChipsSearchContributor('chipssearch',
      this.searchComponent.sizeOnBackspaceBus,
      this.collaborativeService,
      this.configService
    );

    this.timelinecontributor = new HistogramContributor('timeline',
      this.dateUnit.second,
      this.collaborativeService,
      this.configService);

    this.histograms = this.contributorService.getHistograms();
    this.activatedRoute.queryParams
      .pairwise()
      .take(1)
      .timeoutWith(500, Observable.of('initWithoutFilter'))
      .subscribe((params) => {
        if (params.toString() === 'initWithoutFilter') {
          this.collaborativeService.setCollaborations({});
        } else {
          const dataModel = this.collaborativeService.dataModelBuilder(params[1]['filter']);
          this.collaborativeService.setCollaborations(dataModel);
        }
      });
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
}
