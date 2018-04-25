/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Filter } from 'arlas-api';
import { ChartType, DataType, MapglComponent, Position } from 'arlas-web-components';
import { ChipsSearchContributor, HistogramContributor, MapContributor } from 'arlas-web-contributors';
import { Collaboration } from 'arlas-web-core';
import { ShareComponent } from 'arlas-wui-toolkit/components/share/share.component';
import { TagComponent } from 'arlas-wui-toolkit/components/tag/tag.component';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { AboutComponent } from './components/about/about.component';
import { SearchComponent } from './components/search/search.component';
import { ContributorService } from './services/contributors.service';


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
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  public analyticsOpen = true;

  // component config
  public mapComponentConfig: any;
  public timelineComponentConfig: any;
  public tagComponenentConfig: any;
  public shareComponentConfig: any;

  @ViewChild('map') private mapglComponent: MapglComponent;
  @ViewChild('search') private searchComponent: SearchComponent;
  @ViewChild('about') private aboutcomponent: AboutComponent;
  @ViewChild('share') private shareComponent: ShareComponent;
  @ViewChild('tag') private tagComponent: TagComponent;

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
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline.input');
      this.tagComponenentConfig = this.configService.getValue('arlas.web.components.tag');
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
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
        q: [[this.chipsSearchContributor.getConfigValue('search_field') + ':' + value.trim()]]
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

  public displayAbout() {
    this.aboutcomponent.openDialog();
  }

  public displayShare() {
    this.shareComponent.openDialog();
  }

  public displayTag() {
    this.tagComponent.openDialog();
  }
}
