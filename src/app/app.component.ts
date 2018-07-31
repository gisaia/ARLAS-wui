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
import {
  ChipsSearchContributor,
  ElementIdentifier,
  HistogramContributor,
  MapContributor,
  ResultListContributor
} from 'arlas-web-contributors';
import { Collaboration } from 'arlas-web-core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { SearchComponent } from './components/search/search.component';
import { ContributorService } from './services/contributors.service';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  public mapglContributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelineContributor: HistogramContributor;
  public resultlistContributor: ResultListContributor;

  public analytics: Array<any>;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public analyticsOpen = true;

  // component config
  public mapComponentConfig: any;
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;

  public featureToHightLight: {
    isleaving: boolean,
    elementidentifier: ElementIdentifier
  };
  public featuresToSelect: Array<ElementIdentifier> = [];
  private isAutoGeosortActive;
  private geosortConfig;


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
      this.resultlistContributor = this.arlasStartUpService.contributorRegistry.get('table');
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');
      this.analytics = this.configService.getValue('arlas.web.analytics');
      this.refreshButton = this.configService.getValue('arlas-wui.web.app.refresh');
      this.geosortConfig = this.configService.getValue('arlas-wui.web.app.components.geosort');
      if (this.analytics) {
        this.isAutoGeosortActive = this.analytics.filter(g => g.groupId === 'resultlist')
          .map(g => this.isAutoGeosortActive = g.components[0].input.isAutoGeoSortActived);
      }
    }
  }

  public ngOnInit() {
    if (this.arlasStartUpService.shouldRunApp) {
      this.mapglContributor = this.contributorService.getMapContributor(this.mapglComponent.onRemoveBbox, this.mapglComponent.redrawTile);
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor(this.searchComponent.onLastBackSpace);
    }
  }

  public ngAfterViewInit(): void {
    this.mapglComponent.switchLayer.subscribe(data => this.mapglContributor.switchLayerCluster(data));
    let startDragCenter;
    let dragMove = false;
    this.mapglComponent.map.on('dragstart', (e) => {
      dragMove = true;
      startDragCenter = this.mapglComponent.map.getCenter();
    });
    this.mapglComponent.map.on('moveend', (e) => {
      if (dragMove === true) {
        const endDragCenter = this.mapglComponent.map.getCenter();
        const startDragCenterPosition = this.mapglComponent.map.project(startDragCenter);
        const endDragCenterPosition = this.mapglComponent.map.project(endDragCenter);
        const deltaX = Math.abs(startDragCenterPosition.x - endDragCenterPosition.x);
        const deltaY = Math.abs(startDragCenterPosition.y - endDragCenterPosition.y);
        const mapWidth = e.target._canvas.clientWidth;
        const mapHeight = e.target._canvas.clientHeight;
        const dragRatio = (this.geosortConfig) ? this.geosortConfig.dragRatio : 0.05;
        const minGeosortZoom = (this.geosortConfig) ? this.geosortConfig.minGeosortZoom : 8;
        if (this.isAutoGeosortActive && this.mapglComponent.map.getZoom() > minGeosortZoom) {
          if ((deltaX / mapWidth > dragRatio) || (deltaY / mapHeight > dragRatio)) {
            this.resultlistContributor.geoSort(endDragCenter.lat, endDragCenter.lng);
          }
        }
      }
      dragMove = false;
    });
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

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public getBoardEvents(event: { origin: string, event: string, data: any }) {
    switch (event.origin) {
      case 'table':
        switch (event.event) {
          case 'consultedItemEvent':
            this.featureToHightLight = this.mapglContributor.getFeatureToHightLight(event.data);
            break;
          case 'selectedItemsEvent':
            if (event.data.length > 0) {
              this.featuresToSelect = event.data.map(id => ({
                idFieldName: this.mapComponentConfig.idFeatureField,
                idValue: id
              }));
            } else {
              this.featuresToSelect = [];
            }
            break;
          case 'actionOnItemEvent':
            break;
          case 'globalActionEvent':
            break;
          case 'geoSortEvent':
            this.resultlistContributor.geoSort(this.mapglComponent.map.getCenter().lat, this.mapglComponent.map.getCenter().lng);
            break;
          case 'geoAutoSortEvent':
            this.isAutoGeosortActive = event.data;
            break;
        }

        break;
    }
  }
}
