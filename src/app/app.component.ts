/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Filter } from 'arlas-api';
import { ChartType, DataType, MapglComponent, Position } from 'arlas-web-components';
import * as mapboxgl from 'mapbox-gl';
import { SearchComponent } from 'arlas-wui-toolkit/components/search/search.component';
import {
  ChipsSearchContributor,
  ElementIdentifier,
  HistogramContributor,
  MapContributor,
  ResultListContributor,
  AnalyticsContributor
} from 'arlas-web-contributors';
import { Collaboration } from 'arlas-web-core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { ContributorService } from './services/contributors.service';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


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
  public analyticsContributor: AnalyticsContributor;


  public analytics: Array<any>;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public analyticsOpen = true;
  public searchOpen = true;
  public countAll: string;

  // gauge component
  public gaugeMaxValue = 46000000;
  public gaugeThresholdValue = 10000;
  public gaugeCurrentValue = 46000000;

  // component config
  public mapComponentConfig: any;
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;

  public fitbounds: Array<Array<number>> = [];
  public featureToHightLight: {
    isleaving: boolean,
    elementidentifier: ElementIdentifier
  };
  public featuresToSelect: Array<ElementIdentifier> = [];
  private isAutoGeosortActive;
  private geosortConfig;
  private allowMapExtend: boolean;
  private allowMapStyles: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private mapStyles: Array<{styleGroupId: string, styleId: string}>;
  private mapEventListener = new Subject();
  private mapExtendTimer: number;
  private MAP_EXTEND_PARAM = 'extend';
  private MAP_STYLES_PARAM = 'map_styles';

  @ViewChild('map') private mapglComponent: MapglComponent;
  @ViewChild('search') private searchComponent: SearchComponent;

  constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    private arlasStartUpService: ArlasStartupService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    if (this.arlasStartUpService.shouldRunApp) {
      this.resultlistContributor = this.arlasStartUpService.contributorRegistry.get('table');
      this.resultlistContributor.sort = this.configService.getValue('arlas.server.collection.id');
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics');
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      const mapExtendTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer');
      this.mapExtendTimer = (mapExtendTimer !== undefined) ? mapExtendTimer : 4000;
      this.allowMapExtend = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
      this.allowMapStyles = this.configService.getValue('arlas.web.components.mapgl.allowMapStyles');
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');
      this.analytics = this.configService.getValue('arlas.web.analytics');
      this.refreshButton = this.configService.getValue('arlas-wui.web.app.refresh');
      this.geosortConfig = this.configService.getValue('arlas-wui.web.app.components.geosort');
      if (this.analytics) {
        this.isAutoGeosortActive = this.analytics.filter(g => g.groupId === 'resultlist')
          .map(g => this.isAutoGeosortActive = g.components[0].input.isAutoGeoSortActived);
      }
      this.collaborativeService.collaborationBus.subscribe(collaborationEvent => {
        this.collaborativeService.countAll
          .pipe()
          .subscribe(c => this.countAll = c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
      });
    }
  }

  public ngOnInit() {
    if (this.arlasStartUpService.shouldRunApp) {
      this.mapglContributor = this.contributorService.getMapContributor(this.mapglComponent.onRemoveBbox, this.mapglComponent.redrawTile);
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor(this.searchComponent.onLastBackSpace);
      if (this.resultlistContributor) {
        this.resultlistContributor.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '' });
      }
      if (this.allowMapExtend) {
        const extendValue = this.getParamValue(this.MAP_EXTEND_PARAM);
        if (extendValue) {
          const stringBounds = extendValue.split(',');
          if (stringBounds.length === 4) {
            this.mapBounds = new mapboxgl.LngLatBounds(
              new mapboxgl.LngLat(+stringBounds[0], +stringBounds[1]),
              new mapboxgl.LngLat(+stringBounds[2], +stringBounds[3])
            );
          }
        }
      }
      if (this.allowMapStyles) {
        /** Example : ...&map_styles=cluster:heat;features:ship_type&... */
        const mapStylesValue = this.getParamValue(this.MAP_STYLES_PARAM);
        if (mapStylesValue) {
          const styles = mapStylesValue.split(';');
          if (styles.length > 0) {
            this.mapStyles = new Array();
            styles.forEach(selectedStyle => {
              const sg_s = selectedStyle.split(':');
              if (sg_s.length === 2) {
                this.mapStyles.push({styleGroupId: sg_s[0], styleId: sg_s[1]});
              }
            });
          }
        }
      }
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
    if (this.mapBounds && this.allowMapExtend) {
        (<mapboxgl.Map>this.mapglComponent.map).fitBounds(this.mapBounds);
        this.mapBounds = null;
    }
    this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded) {
        if (this.mapStyles && this.allowMapStyles) {
          this.mapStyles.forEach(s => {
            this.mapglComponent.onChangeStyle(s.styleGroupId, s.styleId);
          });
        }
      }
    });
    this.mapglComponent.onStyleChanged.subscribe(styleGroups => {
      let selectedMapStyles = '';
      if (styleGroups) {
        styleGroups.forEach(sg => {
          if (sg.selectedStyle) {
            selectedMapStyles += selectedMapStyles !== '' ? ';' : '';
            selectedMapStyles += sg.id + ':' + sg.selectedStyle.id;
          }
        });
        const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
        queryParams[this.MAP_STYLES_PARAM] = selectedMapStyles;
        this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
      }
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
        const dragRatio = (this.geosortConfig && Number(this.geosortConfig.dragRatio).toString() !== 'NaN') ?
          this.geosortConfig.dragRatio : 0.05;
        const minGeosortZoom = (this.geosortConfig && Number(this.geosortConfig.minGeosortZoom).toString() !== 'NaN') ?
          this.geosortConfig.minGeosortZoom : 8;
        if (this.isAutoGeosortActive && this.mapglComponent.map.getZoom() > minGeosortZoom) {
          if (((deltaX / mapWidth > dragRatio) || (deltaY / mapHeight > dragRatio)) && this.resultlistContributor) {
            this.resultlistContributor.geoSort(endDragCenter.lat, endDragCenter.lng, true);
          }
        }
      }
      dragMove = false;
      if (this.allowMapExtend) {
        this.mapEventListener.next();
      }

    });
    this.mapglContributor.countExtendBus.subscribe(data => {
      const re = /\ /gi;
      this.gaugeMaxValue = parseFloat(this.countAll.replace(re, ''));
      this.gaugeThresholdValue = data.threshold;
      this.gaugeCurrentValue = data.count;
    });
    this.mapEventListener.pipe(debounceTime(this.mapExtendTimer)).subscribe(() => {
      /** Change map extend in the url */
      const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
      const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      queryParams[this.MAP_EXTEND_PARAM] = extend;
      this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
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

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public getBoardEvents(event: { origin: string, event: string, data: any }) {
    switch (event.origin) {
      case 'table':
        switch (event.event) {
          case 'consultedItemEvent':
            const f = this.mapglContributor.getFeatureToHightLight(event.data);
            if (this.mapglContributor.isFlat) {
              f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
            }
            this.featureToHightLight = f;
            break;
          case 'selectedItemsEvent':
            if (event.data.length > 0 && this.mapComponentConfig) {
              this.featuresToSelect = event.data.map(id => {
                if (this.mapglContributor.isFlat) {
                  return {
                  idFieldName: this.mapComponentConfig.idFeatureField.replace(/\./g, '_'),
                  idValue: id
                  };
                } else {
                  return {
                    idFieldName: this.mapComponentConfig.idFeatureField,
                    idValue: id
                  };
                }
              });
            } else {
              this.featuresToSelect = [];
            }
            break;
          case 'actionOnItemEvent':
            switch (event.data.action.id) {
              case 'zoomToFeature':
                this.mapglContributor.getBoundsToFit(event.data.elementidentifier)
                  .subscribe(bounds => this.fitbounds = bounds);
                break;
            }
            break;
          case 'globalActionEvent':
            break;
          case 'geoSortEvent':
            if (this.resultlistContributor) {
              this.resultlistContributor.geoSort(this.mapglComponent.map.getCenter().lat, this.mapglComponent.map.getCenter().lng, true);
            }
            break;
          case 'geoAutoSortEvent':
            this.isAutoGeosortActive = event.data;
            break;
        }

        break;
    }
  }

  private getParamValue(param: string): string {
    let paramValue = null;
    const url = window.location.href;
    const regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (results && results[2]) {
      paramValue = results[2];
    }
    return paramValue;
  }
}
