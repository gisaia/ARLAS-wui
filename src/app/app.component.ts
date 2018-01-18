import { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor, HistogramContributor, ChipsSearchContributor, SwimLaneContributor } from 'arlas-web-contributors';
import { HistogramComponent, MapglComponent } from 'arlas-web-components';
import { DateUnit, DataType, ChartType, Position, drawType } from 'arlas-web-components';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';


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
  public swimLaneContributor: SwimLaneContributor;

  public analytics: Array<any>;
  public mapDrawType = drawType.RECTANGLE;
  public initCenter = [0, 0];
  public dateUnit = DateUnit;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  // component config
  public mapComponentConfig: any;
  @ViewChild('timeline') private histogramComponent: HistogramComponent;
  @ViewChild('map') private mapglComponent: MapglComponent;
  @ViewChild('search') private searchComponent: SearchComponent;

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
      this.swimLaneContributor = this.arlasStartUpService.contributorRegistry.get('airline');
    }
    this.mapComponentConfig = this.configService.getValue('arlas-wui.web.app.components.mapbox');
    this.analytics = this.configService.getValue('arlas.web.analytics');

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
