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
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CellBackgroundStyleEnum, ChartType, Column, DataType, Item, MapglImportComponent,
  ModeEnum, PageQuery, Position, SortEnum
} from 'arlas-web-components';
import {
  AnalyticsContributor, ChipsSearchContributor, ElementIdentifier, ResultListContributor, MapContributor
} from 'arlas-web-contributors';
import {
  ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService,
  ArlasMapService, ArlasMapSettings, ArlasSettingsService, ArlasStartupService, CollectionUnit, TimelineComponent
} from 'arlas-wui-toolkit';
import { Subject, timer, zip } from 'rxjs';
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
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public analyticsContributor: AnalyticsContributor;

  public analytics: Array<any>;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public mapglContributors: Array<MapContributor> = new Array();

  public appName: string;
  public appUnits: CollectionUnit[];
  public appNameBackgroundColor: string;

  // component config
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;
  public resultListsConfig = [];
  public resultListConfigPerContId = new Map<string, any>();

  public menuState: MenuState;
  public analyticsOpen = true;
  public searchOpen = true;

  public listOpen = false;
  public selectedListTabIndex = 0;
  public previewListContrib: ResultListContributor = null;
  public rightListContributors: Array<ResultListContributor> = new Array();

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
  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;
  public constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    public arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private cdr: ChangeDetectorRef,
    private toolkitMapService: ArlasMapService,
    private mapService: MapService,
    public resultlistService: ResultlistService,
    private colorGenerator: ArlasColorGeneratorLoader,
    private sidenavService: SidenavService,
    private titleService: Title,
    private arlasSettingsService: ArlasSettingsService,
    public visualizeService: VisualizeService,
    private activatedRoute: ActivatedRoute,
    private crossCollaborationService: CrossCollaborationsService,
    private crossMapService: CrossMapService,
    private router: Router
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
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics') as AnalyticsContributor;
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
      const resultlistOpenString = getParamValue('ro');
      if (resultlistOpenString) {
        this.listOpen = (resultlistOpenString === 'true');
      }
    }
  }

  public ngOnInit() {
    console.log(this.collaborativeService.registry);
    this.mapglContributors = this.contributorService.getMapContributors();
    this.setAppTitle();
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** Retrieve displayable analytics */
      const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
      const allAnalytics = this.configService.getValue('arlas.web.analytics');
      this.analytics = !!allAnalytics ? allAnalytics.filter(a => !hiddenAnalyticsTabsSet.has(a.tab)) : [];
      /** Retrieve displayable resultlists */
      const hiddenListsTabsSet = new Set(this.hiddenResultlistTabs);
      const allResultlists = this.configService.getValue('arlas.web.components.resultlists');
      const allContributors = this.configService.getValue('arlas.web.contributors');
      this.resultListsConfig = !!allResultlists ? allResultlists.filter(a => {
        const contId = a.contributorId;
        const tab = allContributors.find(c => c.identifier === contId).name;
        return !hiddenListsTabsSet.has(tab);
      }) : [];
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor();
      const ids = new Set(this.resultListsConfig.map(c => c.contributorId));
      this.arlasStartUpService.contributorRegistry.forEach((v, k) => {
        if (v instanceof ResultListContributor) {
          v.updateData = ids.has(v.identifier);
          this.resultlistContributors.push(v);
        }
      });
      this.resultlistService.setContributors(this.resultlistContributors);
      if (this.resultlistContributors.length > 0) {
        this.rightListContributors = this.resultlistContributors
          .filter(c => this.resultListsConfig.some((rc) => c.identifier === rc.contributorId))
          .map(rlcontrib => {
            (rlcontrib as any).name = rlcontrib.getName();
            const sortColumn = rlcontrib.fieldsList.find(c => !!(c as any).sort && (c as any).sort !== '');
            if (!!sortColumn) {
              this.resultlistService.sortOutput.set(rlcontrib.identifier, {
                columnName: sortColumn.columnName,
                fieldName: sortColumn.fieldName,
                sortDirection: (sortColumn as any).sort === 'asc' ? SortEnum.asc : SortEnum.desc
              });
            }
            return rlcontrib;
          });

        this.resultListsConfig.forEach(rlConf => {
          rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
            CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
          this.resultListConfigPerContId.set(rlConf.contributorId, rlConf.input);
        });
        const selectedResultlistTab = getParamValue('rt');
        const previewListContrib = this.rightListContributors.find(r => r.getName() === decodeURI(selectedResultlistTab));
        if (previewListContrib) {
          this.previewListContrib = previewListContrib;
        } else {
          this.previewListContrib = this.rightListContributors[0];
        }
      }

      this.actionOnPopup.subscribe(data => {
        const collection = data.action.collection;
        const mapContributor = this.mapglContributors.filter(m => m.collection === collection)[0];
        const listContributor = this.resultlistContributors.filter(m => m.collection === collection)[0];
        this.actionOnItemEvent(data, mapContributor, listContributor, collection);
      });
    }
  }

  public isElementInViewport(el) {
    if (el) {
      const rect = el.getBoundingClientRect();
      return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    } else {
      return false;
    }
  }

  public ngAfterViewInit(): void {
    this.resultlistContributors.forEach(c => {
      const mapcontributor = this.mapglContributors.find(mc => mc.collection === c.collection);
      if (!!mapcontributor) {
        c.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '', tooltip: 'Zoom to product' });
      }
      if (!!this.resultListConfigPerContId.get(c.identifier)) {
        if (!!this.resultListConfigPerContId.get(c.identifier).visualisationLink) {
          c.addAction({ id: 'visualize', label: 'Visualize', cssClass: '', tooltip: 'Visualize on the map' });
        }
        if (!!this.resultListConfigPerContId.get(c.identifier).downloadLink) {
          c.addAction({ id: 'download', label: 'Download', cssClass: '', tooltip: 'Download' });
        }
      }
    });
    this.menuState.configs = this.arlasStartUpService.emptyMode;
    // Keep the last displayed list as preview when closing the right panel
    if (!!this.tabsList) {
      this.tabsList.selectedIndexChange.subscribe(index => {
        this.previewListContrib = this.resultlistContributors[index];
        const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
        queryParams['rt'] = this.previewListContrib.getName();
        this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
        this.adjustGrids();
        this.adjustTimelineSize();
      });
    }
    if (!!this.previewListContrib) {
      timer(0, 200).pipe(takeWhile(() => this.apploading)).subscribe(() => {
        const mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
        if (this.previewListContrib.data.length > 0 &&
          mapComponentConfig.mapLayers.events.onHover
            .filter(l => this.arlasMapComponent.mapComponent.map.getLayer(l)).length > 0) {
          this.updateVisibleItems();
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

  public updateVisibleItems() {
    const idFieldName = this.resultlistService.collectionToDescription.get(this.previewListContrib.collection).id_path;
    setTimeout(() => {
      const visibleItems = this.previewListContrib.data.map(i => (i.get(idFieldName) as number | string))
        .filter(i => i !== undefined && this.isElementInViewport(document.getElementById(i.toString())));
      this.arlasMapComponent.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }, 500);
  }

  public updateMapStyleFromScroll(items: Array<Item>, collection: string) {
    this.arlasMapComponent.updateMapStyle(items.map(i => i.identifier), collection);
  }

  /**
   * Updates features style on map after repopulating the resultlist with data
   * @param items List of items constituting the resultlist
   */
  public updateMapStyleFromChange(items: Array<Map<string, string>>, collection: string) {
    if (this.resultlistService.collectionToDescription.size > 0) {
      const idFieldName = this.resultlistService.collectionToDescription.get(collection).id_path;
      setTimeout(() => {
        const visibleItems = items.map(item => item.get(idFieldName))
          .filter(id => id !== undefined && this.isElementInViewport(document.getElementById(id.toString())));
        this.arlasMapComponent.updateMapStyle(visibleItems, collection);
      }, 200);
    }
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
      this.mapSettingsService.mapContributors = this.mapglContributors;
    }
    const centroidPath = this.resultlistService.collectionToDescription.get(collection).centroid_path;
    this.toolkitMapService.zoomToData(collection, centroidPath, this.arlasMapComponent.mapComponent.map, 0.2);
  }


  /** This method sorts the list on the given column. The features are also sorted if the `Simple mode` is activated in mapContributor  */
  public sortColumnEvent(contributorId: string, sortOutput: Column) {
    const resultlistContributor = (this.collaborativeService.registry.get(contributorId) as ResultListContributor);
    this.resultlistService.isGeoSortActivated.set(contributorId, false);
    /** Save the sorted column */
    this.resultlistService.sortOutput.set(contributorId, sortOutput);
    /** Sort the list by the selected column and the id field name */
    resultlistContributor.sortColumn(sortOutput, true);
    /** set mapcontritbutor sort */
    let sortOrder = null;
    if (sortOutput.sortDirection.toString() === '0') {
      sortOrder = '';
    } else if (sortOutput.sortDirection.toString() === '1') {
      sortOrder = '-';
    }
    let sort = '';
    if (sortOrder !== null) {
      sort = sortOrder + sortOutput.fieldName;
    }

    this.mapglContributors
      .filter(c => c.collection === resultlistContributor.collection)
      .forEach(c => {
        // Could have some problems if we put 2 lists with the same collection and different sort ?
        c.searchSort = resultlistContributor.sort;
        c.searchSize = resultlistContributor.getConfigValue('search_size');
        /** Redraw features with setted sort in case of window mode */
        /** Remove old features */
        this.arlasMapComponent.clearWindowData(c);
        /** Set new features */
        c.drawGeoSearch(0, true);
      });
  }

  /**
   * Called at the end of scrolling the list
   * @param contributor ResultlistContributor instance that fetches the data
   * @param eventPaginate Which page is queried
   */
  public paginate(contributor, eventPaginate: PageQuery): void {
    contributor.getPage(eventPaginate.reference, eventPaginate.whichPage);
    const sort = this.resultlistService.isGeoSortActivated.get(contributor.identifier) ? contributor.geoOrderSort : contributor.sort;
    this.mapglContributors
      .filter(c => c.collection === contributor.collection)
      .forEach(c => c.getPage(eventPaginate.reference, sort, eventPaginate.whichPage, contributor.maxPages));
  }

  public clickOnTile(item: Item) {
    this.tabsList.realignInkBar();
    const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
    config.defautMode = this.modeEnum.grid;
    config.selectedGridItem = item;
    config.isDetailledGridOpen = true;
    this.resultListConfigPerContId.set(this.previewListContrib.identifier, config);
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    setTimeout(() => this.timelineComponent.timelineHistogramComponent.resizeHistogram(), 100);
  }

  public changeListResultMode(mode: ModeEnum, identifier: string) {
    const config = this.resultListConfigPerContId.get(identifier);
    config.defautMode = mode;
    this.resultListConfigPerContId.set(identifier, config);
    setTimeout(() => {
      this.updateVisibleItems();
    }, 100);
  }

  public getBoardEvents(event: { origin: string; event: string; data?: any; }) {
    const resultListContributor = this.collaborativeService.registry.get(event.origin) as ResultListContributor;
    const currentCollection = resultListContributor.collection;
    const mapContributor: MapContributor = this.mapglContributors.filter(c => c.collection === currentCollection)[0];
    switch (event.event) {
      case 'paginationEvent':
        this.paginate(resultListContributor, event.data);
        break;
      case 'sortColumnEvent':
        this.sortColumnEvent(event.origin, event.data);
        break;
      case 'consultedItemEvent':
        if (!!mapContributor) {
          const id = event.data as ElementIdentifier;
          this.arlasMapComponent.featureToHightLight = this.mapService.getFeatureToHover(id, mapContributor);
          this.crossMapService.propagateFeatureHover(id, mapContributor.identifier);
        }
        break;
      case 'selectedItemsEvent':
        const ids = event.data;
        const idPath = this.resultlistService.collectionToDescription.get(currentCollection).id_path;
        this.mapService.selectFeatures(idPath, ids, mapContributor);
        this.crossMapService.propagateFeaturesSelection(idPath, ids, mapContributor.identifier);
        break;
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        break;
      case 'geoSortEvent':
        break;
      case 'geoAutoSortEvent':
        this.onActiveOnGeosort(event.data, resultListContributor, mapContributor,
          this.arlasMapComponent.centerLatLng.lat, this.arlasMapComponent.centerLatLng.lng);
        break;
    }
    this.actionOnList.next(event);
  }

  public onActiveOnGeosort(data, resultListContributor: ResultListContributor, mapContributor: MapContributor, lat, lng): void {
    this.resultlistService.isGeoSortActivated.set(resultListContributor.identifier, data);
    if (data) {
      /** Apply geosort in list */
      resultListContributor.geoSort(lat, lng, true);
      this.resultlistService.sortOutput.delete(resultListContributor.identifier);
      // this.resultListComponent.columns.filter(c => !c.isIdField).forEach(c => c.sortDirection = SortEnum.none);
      /** Apply geosort in map (for simple mode) */
      this.arlasMapComponent.clearWindowData(mapContributor);
      mapContributor.searchSort = resultListContributor.geoOrderSort;
      mapContributor.searchSize = resultListContributor.pageSize;
      mapContributor.drawGeoSearch(0, true);
    } else {
      const idFieldName = resultListContributor.getConfigValue('fieldsConfiguration')['idFieldName'];
      this.resultlistService.sortOutput.set(resultListContributor.identifier,
        { fieldName: idFieldName, sortDirection: SortEnum.none });
      /** Sort the list by the selected column and the id field name */
      resultListContributor.sortColumn({ fieldName: idFieldName, sortDirection: SortEnum.none }, true);
      mapContributor.searchSort = resultListContributor.sort;
      mapContributor.searchSize = resultListContributor.pageSize;
      this.arlasMapComponent.clearWindowData(mapContributor);
      mapContributor.drawGeoSearch(0, true);
    }
  }

  public toggleList() {
    this.tabsList.realignInkBar();
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.adjustGrids();
    this.adjustTimelineSize();
  }

  private adjustGrids() {
    if (!this.listOpen) {
      const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    } else {
      this.selectedListTabIndex = this.rightListContributors.indexOf(this.previewListContrib);
    }
  }
  private adjustTimelineSize() {
    setTimeout(() => {
      this.timelineComponent.timelineHistogramComponent.resizeHistogram();
      if (!!this.timelineComponent.detailedTimelineHistogramComponent) {
        this.timelineComponent.detailedTimelineHistogramComponent.resizeHistogram();
      }
      this.arlasMapComponent.mapComponent.map.resize();
      this.updateVisibleItems();
    }, 100);
  }

  public toggleAnalytics() {
    this.analyticsOpen = !this.analyticsOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ao'] = this.analyticsOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.arlasMapComponent.adjustMapOffset();
  }

  private actionOnItemEvent(data, mapContributor, listContributor, collection) {
    switch (data.action.id) {
      case 'zoomToFeature':
        if (!!mapContributor) {
          mapContributor.getBoundsToFit(data.elementidentifier, collection)
            .subscribe(bounds => this.visualizeService.fitbounds = bounds);
        }
        break;
      case 'visualize':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlVisualisationTemplate = this.resultListConfigPerContId.get(listContributor.identifier).visualisationLink;
          this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlVisualisationTemplate).subscribe(url => {
            this.visualizeService.displayDataOnMap(url,
              data.elementidentifier, this.resultlistService.collectionToDescription.get(collection).geometry_path,
              this.resultlistService.collectionToDescription.get(collection).centroid_path, collection);
          });
        }
        break;
      case 'download':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlDownloadTemplate = this.resultListConfigPerContId.get(listContributor.identifier).downloadLink;
          if (urlDownloadTemplate) {
            this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlDownloadTemplate).subscribe(url => {
              const win = window.open(url, '_blank');
              win.focus();
            });
          }
        }
        break;
    }
  }

  public ngOnDestroy(): void {
    this.crossCollaborationService.terminate();
    this.crossMapService.terminate();
  }
}
