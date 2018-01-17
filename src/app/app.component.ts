import { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor, HistogramContributor, ChipsSearchContributor, SwimLaneContributor } from 'arlas-web-contributors';
import { FieldsConfiguration, HistogramComponent, MapglComponent } from 'arlas-web-components';
import { DateUnit, DataType, ChartType, Position, drawType } from 'arlas-web-components';
import { SwimlaneMode } from 'arlas-web-components/histogram/histogram.utils';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';

import { Histogram } from './models/histogram';
import { ContributorService } from './services/contributors.service';

import { SearchComponent } from './components/search/search.component';
import { Subject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Collaboration } from 'arlas-web-core';
import { Filter } from 'arlas-api';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public mapglcontributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelinecontributor: HistogramContributor;
  public velocitycontributor: HistogramContributor;
  public headingcontributor: HistogramContributor;
  public geoaltitudecontributor: HistogramContributor;
  public velocityFiltercontributor: HistogramContributor;
  public headingFiltercontributor: HistogramContributor;
  public geoaltitudeFiltercontributor: HistogramContributor;
  public swimLaneContributor: SwimLaneContributor;
  public swimLaneFilterContributor: SwimLaneContributor;

  public histograms: Array<Histogram> = [];
  public analytics: Array<any>;
  public mapDrawType = drawType.RECTANGLE;
  public initCenter = [0, 0];
  public dateUnit = DateUnit;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public fieldsConfiguration: FieldsConfiguration;
  public isAnalyticsHovered = false;
  public isFilterMode = false;
  public zoomToPrecisionCluster: Object;
  public maxPrecision: number;
  public swimlaneMode = SwimlaneMode;

  // component config
  public mapComponentConfig: any;
  @ViewChild('timeline') private histogramComponent: HistogramComponent;
  @ViewChild(MapglComponent) private mapglComponent: MapglComponent;
  @ViewChild(SearchComponent) private searchComponent: SearchComponent;

  constructor(private http: Http,
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    private arlasStartUpService: ArlasStartupService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    if (this.arlasStartUpService.shouldRunApp) {
      this.timelinecontributor = this.arlasStartUpService.contributorRegistry.get('timeline');
      this.velocitycontributor = this.arlasStartUpService.contributorRegistry.get('velocity');
      this.headingcontributor = this.arlasStartUpService.contributorRegistry.get('heading');
      this.geoaltitudecontributor = this.arlasStartUpService.contributorRegistry.get('geoaltitude');
      this.velocityFiltercontributor = this.arlasStartUpService.contributorRegistry.get('velocityFilter');
      this.headingFiltercontributor = this.arlasStartUpService.contributorRegistry.get('headingFilter');
      this.geoaltitudeFiltercontributor = this.arlasStartUpService.contributorRegistry.get('geoaltitudeFilter');

      this.swimLaneContributor = this.arlasStartUpService.contributorRegistry.get('airline');
      this.swimLaneFilterContributor = this.arlasStartUpService.contributorRegistry.get('airlineFilter');
    }
    this.mapComponentConfig = this.configService.getValue('arlas-wui.web.app.components.mapbox');
    this.analytics = this.configService.getValue('arlas.web.analytics');

    this.arlasStartUpService.contributorRegistry.forEach( (v, k) => {
      if( v !== undefined && v.identifier !== 'timeline' ){
        this.histograms.push(v);
      }
    });

    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.collaborativeService.collaborationBus.subscribe(collaborationEvent => {
      queryParams['filter'] = this.collaborativeService.urlBuilder().split('=')[1];
      if (collaborationEvent.id !== 'url') {
        this.router.navigate(['.'], { queryParams: queryParams });
      }
    });
  }

  public ngOnInit() {
    if (this.arlasStartUpService.shouldRunApp) {
      this.mapglcontributor = this.contributorService.getMapContributor(this.mapglComponent.onRemoveBbox, this.mapglComponent.redrawTile,
        this.mapDrawType
      );
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor(this.searchComponent.onLastBackSpace);
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

  public filterSearch(value: string) {
    if (value.trim() !== '') {
      const filter: Filter = {
        q: [[value.trim()]]
      };

      const collaboration: Collaboration = {
        filter: filter,
        enabled: true
      };

      this.collaborativeService.setFilter(this.chipsSearchContributor.identifier, collaboration);
    }
  }

}
