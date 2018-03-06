import { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

import { MapContributor, HistogramContributor, ChipsSearchContributor } from 'arlas-web-contributors';
import { DateUnit, DataType, ChartType, Position, MapglComponent } from 'arlas-web-components';
import { Collaboration } from 'arlas-web-core';
import { Filter } from 'arlas-api';
import { ContributorService } from './services/contributors.service';
import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { SearchComponent } from './components/search/search.component';

@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public mapglContributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelineContributor: HistogramContributor;

  public analytics: Array<any>;
  public initCenter = [0, 0];
  public dateUnit = DateUnit;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  public analyticsOpen = true;

  // component config
  public mapComponentConfig: any;
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
      this.timelineContributor = this.arlasStartUpService.contributorRegistry.get('timeline');
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      this.analytics = this.configService.getValue('arlas.web.analytics');
    }
  }

  public ngOnInit() {
    if (this.arlasStartUpService.shouldRunApp) {
      this.mapglContributor = this.contributorService.getMapContributor(this.mapglComponent.onRemoveBbox, this.mapglComponent.redrawTile);
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor(this.searchComponent.onLastBackSpace);
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

  public toggleAnalytics(event: string) {
    this.analyticsOpen = !this.analyticsOpen;
  }

}
