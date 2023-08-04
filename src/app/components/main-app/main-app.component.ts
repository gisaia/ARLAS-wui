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
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChartType, DataType, Item,
  ModeEnum, Position
} from 'arlas-web-components';
import {
  ChipsSearchContributor, ElementIdentifier, MapContributor
} from 'arlas-web-contributors';
import {
  ArlasCollaborativesearchService, ArlasConfigService,
  ArlasMapService, ArlasMapSettings, ArlasSettingsService, ArlasStartupService, CollectionUnit, TimelineComponent
} from 'arlas-wui-toolkit';
import { Subject, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { CrossCollaborationsService } from 'app/services/cross-tabs-communication/cross.collaboration.service';
import { CrossMapService } from 'app/services/cross-tabs-communication/cross.map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { getParamValue } from 'app/tools/utils';
import { SidenavService } from 'app/services/sidenav.service';
import { VisualizeService } from 'app/services/visualize.service';
import { ArlasMapComponent } from '../arlas-map/arlas-map.component';
import { MenuState } from '../left-menu/left-menu.component';
import { ContributorService } from 'app/services/contributors.service';
import { MapService } from 'app/services/map.service';
import { ArlasListComponent } from '../arlas-list/arlas-list.component';

@Component({
  selector: 'arlas-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.css']
})
export class MainAppComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public version: string;
  @Output() public actionOnPopup = new Subject<{
    action: {
      id: string;
      label: string;
      collection: string;
      cssClass?: string | string[];
      tooltip?: string;
    };
    elementidentifier: ElementIdentifier;
  }>();
  @Output() public actionOnList = new Subject<{ origin: string; event: string; data?: any; }>();


  public modeEnum = ModeEnum;
  public chipsSearchContributor: ChipsSearchContributor;

  public analyticsAreConfigured: boolean;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  public appName: string;
  public appUnits: CollectionUnit[];
  public appNameBackgroundColor: string;

  // component config
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;

  public menuState: MenuState;
  public analyticsOpen = true;
  public searchOpen = true;
  public listOpen = false;
  public selectedListTabIndex = 0;

  /* Options */
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };

  public showZoomToData = false;
  public showIndicators = false;
  public onSideNavChange: boolean;

  @Input() public hiddenAnalyticsTabs: string[] = [];
  @Input() public hiddenResultlistTabs: string[] = [];

  public collections: string[];
  public apploading = true;
  @ViewChild('arlasmap', { static: false }) public arlasMapComponent: ArlasMapComponent;
  @ViewChild('arlaslists', { static: false }) public arlasListComponent: ArlasListComponent;
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;
  public constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    public arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private cdr: ChangeDetectorRef,
    private toolkitMapService: ArlasMapService,
    public resultlistService: ResultlistService,
    private sidenavService: SidenavService,
    private titleService: Title,
    private arlasSettingsService: ArlasSettingsService,
    public visualizeService: VisualizeService,
    private activatedRoute: ActivatedRoute,
    private crossCollaborationService: CrossCollaborationsService,
    private crossMapService: CrossMapService,
    private router: Router,
    private mapService: MapService
  ) {
    this.menuState = {
      configs: false
    };
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** trigger 'resize' event after toggling sidenav  */
      this.sidenavService.sideNavState.subscribe(res => {
        this.onSideNavChange = res;
        window.dispatchEvent(new Event('resize'));
      });
      this.appName = !!this.configService.appName ? this.configService.appName :
        this.configService.getValue('arlas-wui.web.app.name') ?
          this.configService.getValue('arlas-wui.web.app.name') : 'ARLAS';
      this.appUnits = this.configService.getValue('arlas-wui.web.app.units') ?
        this.configService.getValue('arlas-wui.web.app.units') : [];
      /** retrocompatibility code for unit*/
      const appUnit = this.configService.getValue('arlas-wui.web.app.unit');
      if (appUnit || this.appUnits.length === 0) {
        this.appUnits.push({
          collection: this.collaborativeService.defaultCollection,
          unit: !!appUnit ? appUnit : this.collaborativeService.defaultCollection,
          ignored: false
        });
      }
      /** end of retrocompatibility code */
      this.appNameBackgroundColor = this.configService.getValue('arlas-wui.web.app.name_background_color') ?
        this.configService.getValue('arlas-wui.web.app.name_background_color') : '#FF4081';
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');

      this.refreshButton = this.configService.getValue('arlas-wui.web.app.refresh');


      if (this.configService.getValue('arlas.web.options.spinner')) {
        this.spinner = Object.assign(this.spinner, this.configService.getValue('arlas.web.options.spinner'));
      }
      if (this.configService.getValue('arlas.web.options.zoom_to_data')) {
        this.showZoomToData = true;
      }
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
      const analyticOpenString = getParamValue('ao');
      if (!!analyticOpenString) {
        this.analyticsOpen = (analyticOpenString === 'true');
      }
    }
  }

  public ngOnInit() {
    this.setAppTitle();
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** Retrieve displayable analytics */
      const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
      const allAnalytics = this.configService.getValue('arlas.web.analytics') as Array<any>;
      this.analyticsAreConfigured = !!allAnalytics ? allAnalytics.filter(a => !hiddenAnalyticsTabsSet.has(a.tab)).length > 0 : false;
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor();

      this.resultlistService.actionOnList.subscribe(action => this.actionOnList.next(action));
    }
  }

  public ngAfterViewInit(): void {
    const resultlistOpenString = getParamValue('ro');
    if (resultlistOpenString) {
      this.listOpen = (resultlistOpenString === 'true');
    }

    this.menuState.configs = this.arlasStartUpService.emptyMode;
    // Keep the last displayed list as preview when closing the right panel
    if (!!this.arlasListComponent.tabsList) {
      this.arlasListComponent.tabsList.selectedIndexChange.subscribe(index => {
        this.resultlistService.previewListContrib = this.resultlistService.resultlistContributors[index];
        const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
        queryParams['rt'] = this.resultlistService.previewListContrib.getName();
        this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
        this.adjustGrids();
        this.adjustTimelineSize();
      });
    }
    if (!!this.resultlistService.previewListContrib) {
      timer(0, 200).pipe(takeWhile(() => this.apploading)).subscribe(() => {
        const mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
        if (this.resultlistService.previewListContrib.data.length > 0 &&
          mapComponentConfig.mapLayers.events.onHover
            .filter(l => this.mapService.mapComponent.map.getLayer(l)).length > 0) {
          this.resultlistService.updateVisibleItems();
          this.apploading = false;
        }
      });
    }
    this.cdr.detectChanges();
  }

  public setAppTitle() {
    const prefixTitle = this.arlasSettingsService.settings['tab_name'] ?
      this.arlasSettingsService.settings['tab_name'] : '';
    this.titleService.setTitle(prefixTitle === '' ? this.appName :
      prefixTitle.concat(' - ').concat(this.appName));
  }



  public consumeMenuEvents(states: MenuState) {
    this.menuState = states;
  }

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public zoomToData(collection: string): void {
    if (!this.mapSettingsService.mapContributors || this.mapSettingsService.mapContributors.length === 0) {
      this.mapSettingsService.mapContributors = this.mapService.mapContributors;
    }
    const centroidPath = this.resultlistService.collectionToDescription.get(collection).centroid_path;
    this.toolkitMapService.zoomToData(collection, centroidPath, this.arlasMapComponent.mapComponent.map, 0.2);
  }

  public clickOnTile(item: Item) {
    this.arlasListComponent.tabsList.realignInkBar();
    const config = this.resultlistService.resultListConfigPerContId.get(this.resultlistService.previewListContrib.identifier);
    config.defautMode = this.modeEnum.grid;
    config.selectedGridItem = item;
    config.isDetailledGridOpen = true;
    this.resultlistService.resultListConfigPerContId.set(this.resultlistService.previewListContrib.identifier, config);
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    setTimeout(() => this.timelineComponent.timelineHistogramComponent.resizeHistogram(), 100);
  }

  public toggleList() {
    this.arlasListComponent.tabsList.realignInkBar();
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.adjustGrids();
    this.adjustTimelineSize();
  }

  private adjustGrids() {
    if (!this.listOpen) {
      const config = this.resultlistService.resultListConfigPerContId.get(this.resultlistService.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    } else {
      this.selectedListTabIndex = this.resultlistService.rightListContributors.indexOf(this.resultlistService.previewListContrib);
    }
  }
  private adjustTimelineSize() {
    setTimeout(() => {
      this.timelineComponent.timelineHistogramComponent.resizeHistogram();
      if (!!this.timelineComponent.detailedTimelineHistogramComponent) {
        this.timelineComponent.detailedTimelineHistogramComponent.resizeHistogram();
      }
      this.arlasMapComponent.mapComponent.map.resize();
      this.resultlistService.updateVisibleItems();
    }, 100);
  }

  public toggleAnalytics() {
    this.analyticsOpen = !this.analyticsOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ao'] = this.analyticsOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.arlasMapComponent.adjustMapOffset();
  }

  public ngOnDestroy(): void {
    this.crossCollaborationService.terminate();
    this.crossMapService.terminate();
  }
}
