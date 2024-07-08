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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from 'app/services/map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  ArlasColorService,
  CellBackgroundStyleEnum,
  ChartType,
  Column,
  DataType,
  Item,
  ModeEnum,
  PageQuery,
  Position,
  ResultListComponent,
  SortEnum
} from 'arlas-web-components';
import {
  AnalyticsContributor,
  ChipsSearchContributor,
  ElementIdentifier,
  MapContributor,
  ResultListContributor
} from 'arlas-web-contributors';
import {
  AnalyticsService,
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasExportCsvService,
  ArlasMapService,
  ArlasMapSettings,
  ArlasSettingsService,
  ArlasStartupService,
  CollectionUnit,
  FilterShortcutConfiguration,
  NOT_CONFIGURED,
  ProcessComponent,
  ProcessService,
  TimelineComponent
} from 'arlas-wui-toolkit';
import * as mapboxgl from 'mapbox-gl';
import { fromEvent, Subject, timer, zip } from 'rxjs';
import { debounceTime, finalize, takeUntil, takeWhile } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContributorService } from '../../services/contributors.service';
import { DynamicComponentService } from '../../services/dynamicComponent.service';
import { VisualizeService } from '../../services/visualize.service';
import { ArlasMapComponent } from '../arlas-map/arlas-map.component';
import { MenuState } from '../left-menu/left-menu.component';

@Component({
  selector: 'arlas-wui-root',
  templateUrl: './arlas-wui-root.component.html',
  styleUrls: ['./arlas-wui-root.component.scss'],
})
export class ArlasWuiRootComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  public appName: string;
  public appUnits: CollectionUnit[];
  public appNameBackgroundColor: string;

  // component config
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;
  /**
   * Whether the legend of the timeline is displayed. If both the analytics and the list are open, then the legend is hidden
   */
  public isTimelineLegend = true;

  public resultListsConfig = [];
  public resultListConfigPerContId = new Map<string, any>();
  public resultlistIsExporting = false;

  public menuState: MenuState;
  public searchOpen = true;
  public previewListContrib: ResultListContributor = null;
  public rightListContributors: Array<ResultListContributor> = new Array();
  /* Options */
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
  public showZoomToData = false;
  public showIndicators = false;
  public onSideNavChange: boolean;
  public mainCollection;
  public isTimelineOpen = true;

  public mapglContributors = new Array<MapContributor>();

  @Input() public hiddenAnalyticsTabs: string[] = [];
  @Input() public hiddenResultlistTabs: string[] = [];
  /**
   * @Input : Angular
   * @description Width in pixels of the preview result list
   */
  @Input() public previewListWidth = 125;
  /**
   * @Input : Angular
   * @description Width in pixels of the result list
   */
  @Input() public listWidth = 500;
  /**
   * @Input : Angular
   * @description Number of columns in the grid result list
   */
  @Input() public resultListGridColumns = 4;
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public collections: string[];
  public apploading = true;

  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;
  @ViewChild('resultsidenav', { static: false }) public resultListComponent: ResultListComponent;
  @ViewChild('arlasmap', { static: false }) public arlasMapComponent: ArlasMapComponent;

  /** Shortcuts */
  public shortcuts = new Array<FilterShortcutConfiguration>();
  public extraShortcuts = new Array<FilterShortcutConfiguration>();
  public shortcutOpen: number;
  public isExtraShortcutsOpen = false;
  public extraShortcutsFiltered = 0;
  public shortcutWidth = 250;
  /**
   * @description Whether to exceptionally display the shortcuts for size computing
   */
  public showShortcuts = false;
  public showMoreShortcutsWidth: number;

  /** Collection counts */
  /**
   * @description Space available to display the counts in the top bar
   */
  public availableSpaceCounts: number;
  /**
   * @description Spacing used in the WUI to separate elements
   */
  public spacing = 5;

  /* Process */
  private downloadDialogRef: MatDialogRef<ProcessComponent>;

  /** Destroy subscriptions */
  private _onDestroy$ = new Subject<boolean>();

  public constructor(
    private configService: ArlasConfigService,
    protected settingsService: ArlasSettingsService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    public arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private cdr: ChangeDetectorRef,
    private toolkitMapService: ArlasMapService,
    private colorService: ArlasColorService,
    private titleService: Title,
    private dynamicComponentService: DynamicComponentService,
    public visualizeService: VisualizeService,
    private translate: TranslateService,
    private snackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public analyticsService: AnalyticsService,
    private dialog: MatDialog,
    private processService: ProcessService,
    protected resultlistService: ResultlistService,
    private exportService: ArlasExportCsvService,
    protected mapService: MapService
  ) {
    this.menuState = {
      configs: false
    };
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** resize the map */
      fromEvent(window, 'resize').pipe(debounceTime(100))
        .subscribe((event: Event) => {
          this.resizeCollectionCounts();
          this.adjustVisibleShortcuts();
          this.adjustComponentsSize();
        });

      this.appName = this.configService.appName ?? (this.configService.getValue('arlas-wui.web.app.name') ?? 'ARLAS');

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

      this.mainCollection = this.configService.getValue('arlas.server.collection.name');

      if (this.configService.getValue('arlas.web.options.spinner')) {
        this.spinner = Object.assign(this.spinner, this.configService.getValue('arlas.web.options.spinner'));
      }
      if (this.configService.getValue('arlas.web.options.zoom_to_data')) {
        this.showZoomToData = true;
      }
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }

      /** init from url */
      this.isTimelineOpen = this.getParamValue('to') === 'true';

      let wasTabSelected = this.getParamValue('at') !== null;
      this.analyticsService.tabChange.subscribe(tab => {
        // If there is a change in the state of the analytics (open/close), resize
        if (wasTabSelected !== (tab !== undefined)) {
          this.adjustComponentsSize();
          wasTabSelected = (tab !== undefined);
        }
        this.updateTimelineLegendVisibility();
      });
    }
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.complete();
  }

  public ngOnInit() {

    if (!this.version) {
      this.version = environment.VERSION;
    }
    this.setAppTitle();
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** Retrieve displayable analytics */
      const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
      const allAnalytics = this.arlasStartUpService.analytics;
      this.analyticsService.initializeGroups(!!allAnalytics ? allAnalytics.filter(a => !hiddenAnalyticsTabsSet.has(a.tab)) : []);
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
      this.resultlistService.setContributors(this.resultlistContributors, this.resultListsConfig);

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

        // Check if the user can access process endpoint
        const processSettings = this.settingsService.getProcessSettings();
        const externalNode = this.configService.getValue('arlas.web.externalNode');
        if (
          !!processSettings && !!processSettings.url
          && !!externalNode && !!externalNode.download && externalNode.download === true
        ) {
          this.processService.check()
            .pipe(takeUntil(this._onDestroy$))
            .subscribe({
              next: () => {
                this.resultlistContributors.forEach(c => {
                  const listActionsId = c.actionToTriggerOnClick.map(a => a.id);
                  if (!listActionsId.includes('production')) {
                    c.addAction({ id: 'production', label: 'Download', cssClass: '', tooltip: 'Download' });
                    const resultConfig = this.resultListConfigPerContId.get(c.identifier);
                    if (resultConfig) {
                      if (!resultConfig.globalActionsList) {
                        resultConfig.globalActionsList = [];
                      }
                      resultConfig.globalActionsList.push({ 'id': 'production', 'label': 'Download' });
                    }
                  }

                });
              }
            });
        }

        const selectedResultlistTab = this.getParamValue('rt');
        const previewListContrib = this.rightListContributors.find(r => r.getName() === decodeURI(selectedResultlistTab));
        if (previewListContrib) {
          this.previewListContrib = previewListContrib;
        } else {
          this.previewListContrib = this.rightListContributors[0];
        }
      }

      this.actionOnPopup
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(data => {
          const collection = data.action.collection;
          const mapContributor = this.mapglContributors.filter(m => m.collection === collection)[0];
          const listContributor = this.resultlistContributors.filter(m => m.collection === collection)[0];
          this.actionOnItemEvent(data, mapContributor, listContributor, collection);
        });

      this.collections = [...new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection))];

      // Set MapContributors
      const mapContributors = [];
      this.contributorService.getMapContributors().forEach(mapContrib => {
        mapContrib.colorGenerator = this.colorService.colorGenerator;
        if (!!this.resultlistContributors) {
          const resultlistContrbutor: ResultListContributor = this.resultlistContributors
            .find(resultlistContrib => resultlistContrib.collection === mapContrib.collection);
          if (!!resultlistContrbutor) {
            mapContrib.searchSize = resultlistContrbutor.pageSize;
            mapContrib.searchSort = resultlistContrbutor.sort;
          } else {
            mapContrib.searchSize = 50;
          }
        }
        mapContributors.push(mapContrib);
      });
      this.mapService.setContributors(mapContributors);

      zip(...this.collections.map(c => this.collaborativeService.describe(c)))
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(cdrs => {
          cdrs.forEach(cdr => {
            this.collectionToDescription.set(cdr.collection_name, cdr.params);
          });
          this.resultlistService.setCollectionsDescription(this.collectionToDescription);
          const bounds = (<mapboxgl.Map>this.arlasMapComponent.mapglComponent?.map)?.getBounds();
          if (!!bounds) {
            (<mapboxgl.Map>this.arlasMapComponent.mapglComponent?.map).fitBounds(bounds, { duration: 0 });
          }
          if (this.resultlistContributors.length > 0) {
            this.resultlistContributors.forEach(c => c.sort = this.collectionToDescription.get(c.collection).id_path);
          }
        });

      // Add actions to resultlist contributors
      this.resultlistContributors.forEach(c => {
        const listActionsId = c.actionToTriggerOnClick.map(a => a.id);
        const mapcontributor = mapContributors.find(mc => mc.collection === c.collection);
        if (!!mapcontributor && !listActionsId.includes('zoomToFeature')) {
          c.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '', tooltip: marker('Zoom to product') });
        }
        if (!!this.resultListConfigPerContId.get(c.identifier)) {
          if (!!this.resultListConfigPerContId.get(c.identifier).visualisationLink && !listActionsId.includes('visualize')) {
            c.addAction({ id: 'visualize', label: 'Visualize', cssClass: '', tooltip: marker('Visualize on the map') });
          }
          if (!!this.resultListConfigPerContId.get(c.identifier).downloadLink && !listActionsId.includes('download')) {
            c.addAction({ id: 'download', label: 'Download', cssClass: '', tooltip: marker('Download') });
          }
        }

      });
      this.declareResultlistExportCsv();

      this.shortcuts = this.arlasStartUpService.filtersShortcuts;

      this.collaborativeService.ongoingSubscribe
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(() => {
          if (this.collaborativeService.totalSubscribe === 0) {
            // Check for all contributor in the extra if there is a collab
            this.extraShortcutsFiltered = 0;
            this.extraShortcuts.map(conf => conf.component?.contributorId).forEach(
              contribId => {
                if (contribId) {
                  const collaboration = this.collaborativeService.getCollaboration(contribId);
                  if (collaboration) {
                    this.extraShortcutsFiltered += 1;
                  }
                }
              }
            );
          }
        });
    }
  }

  public isElementInViewport(el: HTMLElement) {
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

  public declareResultlistExportCsv() {
    if (this.settingsService.isResultListExportEnabled()) {
      this.resultlistContributors.forEach(c => {
        const resultConfig = this.resultListConfigPerContId.get(c.identifier);
        if (resultConfig) {
          if (!resultConfig.globalActionsList) {
            resultConfig.globalActionsList = [];
          }
          resultConfig.globalActionsList.push({ 'id': 'export_csv', 'label': 'Export csv', 'alwaysEnabled': true });
        }
      });
    }
  }

  public ngAfterViewInit(): void {
    if (!this.arlasStartUpService.emptyMode) {
      this.resizeCollectionCounts();
      this.adjustVisibleShortcuts();
      this.adjustComponentsSize();
      // Keep the last displayed list as preview when closing the right panel
      if (!!this.tabsList) {
        this.tabsList.selectedIndexChange
          .pipe(takeUntil(this._onDestroy$))
          .subscribe(index => {
            this.resultlistService.selectedListTabIndex = index;
            this.previewListContrib = this.resultlistContributors[index];

            const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
            queryParams['rt'] = this.previewListContrib.getName();
            this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
            this.adjustGrids();
            this.adjustComponentsSize();
          });
      }

      // TODO: remove when the resultlist is externalised
      if (!!this.previewListContrib) {
        timer(0, 200)
          .pipe(
            takeUntil(this._onDestroy$),
            takeWhile(() => this.apploading))
          .subscribe(() => {
            if (this.previewListContrib.data.length > 0 &&
              this.mapService.getMapConfig().mapLayers.events.onHover.filter(l => this.mapService.mapComponent?.map.getLayer(l)).length > 0) {
              this.updateVisibleItems();
              this.apploading = false;
            }
          });
      }
      this.resultlistService.setResultlistComponent(this.resultListComponent);
      this.cdr.detectChanges();
    }
  }

  public setAppTitle() {
    const prefixTitle = (!!this.settingsService.settings.tab_name && this.settingsService.settings.tab_name !== NOT_CONFIGURED) ?
      this.settingsService.settings.tab_name : '';
    this.titleService.setTitle(prefixTitle === '' ? this.appName :
      prefixTitle.concat(' - ').concat(this.appName));
  }

  /**
   * Update which elements from the list are visible on the map
   */
  public updateVisibleItems() {
    if (this.previewListContrib && !!this.collectionToDescription.get(this.previewListContrib.collection)) {
      const idFieldName = this.collectionToDescription.get(this.previewListContrib.collection).id_path;
      const visibleItems = this.previewListContrib.data.map(i => (i.get(idFieldName) as number | string))
        .filter(i => i !== undefined && this.isElementInViewport(document.getElementById(i.toString())));
      this.mapService.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }
  }

  public updateMapStyleFromScroll(items: Array<Item>, collection: string) {
    this.mapService.updateMapStyle(items.map(i => i.identifier), collection);
  }

  /**
   * Updates features style on map after repopulating the resultlist with data
   * @param items List of items constituting the resultlist
   */
  public updateMapStyleFromChange(items: Array<Map<string, string>>, collection: string) {
    if (this.collectionToDescription.size > 0) {
      const idFieldName = this.collectionToDescription.get(collection).id_path;
      setTimeout(() => {
        const visibleItems = items.map(item => item.get(idFieldName))
          .filter(id => id !== undefined && this.isElementInViewport(document.getElementById(id.toString())));
        this.mapService.updateMapStyle(visibleItems, collection);
      }, 200);
    }
  }

  public consumeMenuEvents(states: MenuState) {
    this.menuState = states;
  }

  public zoomToData(collection: string): void {
    if (!this.mapSettingsService.mapContributors || this.mapSettingsService.mapContributors.length === 0) {
      this.mapSettingsService.mapContributors = this.mapglContributors;
    }
    const centroidPath = this.collectionToDescription.get(collection).centroid_path;
    this.toolkitMapService.zoomToData(collection, centroidPath, this.arlasMapComponent.mapglComponent.map, 0.2);
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
        this.mapService.clearWindowData(c);
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
    this.resultlistService.toggleList();
    setTimeout(() => this.timelineComponent.timelineHistogramComponent.resizeHistogram(), 100);
  }

  public changeListResultMode(mode: ModeEnum, identifier: string) {
    const config = this.resultListConfigPerContId.get(identifier);
    config.defautMode = mode;
    this.resultListConfigPerContId.set(identifier, config);
    setTimeout(() => {
      this.updateVisibleItems();
    }, 0);
  }

  public getBoardEvents(event: { origin: string; event: string; data?: any; }) {
    const resultListContributor = this.collaborativeService.registry.get(event.origin) as ResultListContributor;
    const currentCollection = resultListContributor.collection;
    const mapContributor: MapContributor = this.mapService.getContributorByCollection(currentCollection);
    switch (event.event) {
      case 'paginationEvent':
        this.paginate(resultListContributor, event.data);
        break;
      case 'sortColumnEvent':
        this.sortColumnEvent(event.origin, event.data);
        break;
      case 'consultedItemEvent':
        if (!!mapContributor) {
          const f = mapContributor.getFeatureToHightLight(event.data);
          if (mapContributor) {
            f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
          }
          this.mapService.featureToHightLight = f;
        }
        break;
      case 'selectedItemsEvent':
        const ids = event.data;
        const idPath = this.collectionToDescription.get(currentCollection).id_path;
        this.mapService.selectFeatures(idPath, ids, mapContributor);
        break;
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        if (event.data.id === 'production') {
          const idsItemSelected: ElementIdentifier[] = this.mapService.mapComponent.featuresToSelect;
          this.process(idsItemSelected.map(i => i.idValue), currentCollection);
        } else if (event.data.id === 'export_csv') {
          this.resultlistIsExporting = true;
          this.exportService.fetchResultlistData$(resultListContributor, undefined)
            .pipe(finalize(() => this.resultlistIsExporting = false))
            .subscribe({
              next: (h) => this.exportService.exportResultlist(resultListContributor, h),
              error: (e) => this.snackbar.open(marker('An error occured exporting the list'))
            });
        }
        break;
      case 'geoSortEvent':
        break;
      case 'geoAutoSortEvent':
        this.onActiveOnGeosort(event.data, resultListContributor);
        break;
    }
    this.actionOnList.next(event);
  }

  public onActiveOnGeosort(data, resultListContributor: ResultListContributor): void {
    this.resultlistService.isGeoSortActivated.set(resultListContributor.identifier, data);
    const mapContributor = this.mapService.getContributorByCollection(resultListContributor.collection);
    if (data) {
      /** Apply geosort in list */
      const lat = this.mapService.centerLatLng.lat;
      const lng = this.mapService.centerLatLng.lng;
      resultListContributor.geoSort(lat, lng, true);
      this.resultlistService.sortOutput.delete(resultListContributor.identifier);
      // this.resultListComponent.columns.filter(c => !c.isIdField).forEach(c => c.sortDirection = SortEnum.none);
      /** Apply geosort in map (for simple mode) */
      this.mapService.clearWindowData(mapContributor);
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
      this.mapService.clearWindowData(mapContributor);
      mapContributor.drawGeoSearch(0, true);
    }
  }

  public toggleList() {
    this.tabsList.realignInkBar();
    this.resultlistService.toggleList();
    this.updateTimelineLegendVisibility();
    this.adjustGrids();
    this.adjustComponentsSize();
    this.adjustVisibleShortcuts();
  }

  public toggleTimeline() {
    this.isTimelineOpen = !this.isTimelineOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['to'] = this.isTimelineOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public updateTimelineLegendVisibility() {
    this.isTimelineLegend = !(this.resultlistService.listOpen && this.analyticsService.activeTab !== undefined);
  }

  public closeAnalytics() {
    this.analyticsService.selectTab(undefined);
  }

  public onOpenShortcut(state: boolean, shortcutIdx: number) {
    if (state) {
      this.shortcutOpen = shortcutIdx;
      // If open one of the visible shortcuts, hide the extra ones
      if (this.shortcutOpen < this.shortcuts.length) {
        this.isExtraShortcutsOpen = false;
      }
    } else {
      this.shortcutOpen = -1;
    }
  }

  public toggleExtraShortcuts(): void {
    this.isExtraShortcutsOpen = !this.isExtraShortcutsOpen;
    this.showMoreShortcutsWidth = document.getElementById('extra-shortcuts-title').getBoundingClientRect().width;
    // If the extra shortcuts are opened, and the open shortcut is the last visible one, close it for visibility reasons
    if (this.isExtraShortcutsOpen && this.shortcutOpen === this.shortcuts.length - 1) {
      this.shortcutOpen = -1;
    }
  }

  public goToArlasHub() {
    const hubUrl = this.settingsService.getArlasHubUrl();
    if (!!hubUrl) {
      window.open(hubUrl);
    }
  }

  /**
   * Compute the space available between the divider after the search and the title of the application
   */
  private resizeCollectionCounts() {
    // Add padding to the left of the divider and right of the title
    const start = document.getElementById('menuDivider').getBoundingClientRect().right + this.spacing;
    const end = document.getElementById('title').getBoundingClientRect().left - this.spacing;
    this.availableSpaceCounts = end - start;
  }

  private adjustGrids() {
    if (!this.resultlistService.listOpen) {
      const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    } else {
      this.resultlistService.selectedListTabIndex = this.rightListContributors.indexOf(this.previewListContrib);
    }
  }

  /**
   * Adjust ARLAS elements size:
   * - Timeline
   * - Map
   * - Coordinates
   *
   * As well as which list elements are visible on the map
   */
  private adjustComponentsSize() {
    setTimeout(() => {
      if (this.timelineComponent.timelineHistogramComponent) {
        this.timelineComponent.timelineHistogramComponent.resizeHistogram();
        if (!!this.timelineComponent.detailedTimelineHistogramComponent) {
          this.timelineComponent.detailedTimelineHistogramComponent.resizeHistogram();
        }
      }
      this.mapService.mapComponent?.map?.resize();
      this.mapService.adjustCoordinates();

      this.updateVisibleItems();
    }, 0);
  }

  /**
   * Transfer shortcuts from the visible ones to the extra ones based on the space available in the window
   */
  private adjustVisibleShortcuts(): void {
    // Change visibility of shortcuts by merging them together
    if (!this.shortcuts) {
      return;
    }

    this.shortcuts = [...this.shortcuts, ...this.extraShortcuts];
    this.extraShortcuts = new Array();
    this.showShortcuts = true;
    this.cdr.detectChanges();

    // The threshold is based on the window inner size and the available size for the shortcuts
    // The shortcuts are spaced on the left from the menu, and must not overflow on the legend on the right,
    // with a minimum spacing equal to the one on the left.
    const previewListOpen = !!this.previewListContrib && !this.resultlistService.listOpen
      && this.resultListConfigPerContId.get(this.previewListContrib.identifier)?.hasGridMode;
    const mapActionsAndLegendWidth = 270;
    const leftMenuWidth = 48;
    this.showMoreShortcutsWidth = document.getElementById('extra-shortcuts-title').getBoundingClientRect().width;
    const threshold = window.innerWidth - leftMenuWidth
      - (this.resultlistService.listOpen ? this.listWidth : previewListOpen ? this.previewListWidth : 0)
      - this.spacing - this.showMoreShortcutsWidth - this.spacing - mapActionsAndLegendWidth;

    const widths = this.shortcuts.map((_, idx) => document.getElementById(`shortcut-${idx}`).getBoundingClientRect().width);
    let cumulativeWidth = 0;
    let breakOffIndex = 0;

    // Find the index of the first shortcut that does not fit
    for (const width of widths) {
      cumulativeWidth += width;
      if (cumulativeWidth > threshold) {
        break;
      }
      breakOffIndex++;
    }

    // Transfer extra shortcuts in the dedicated list
    if (breakOffIndex !== this.shortcuts.length) {
      this.extraShortcuts = this.shortcuts.splice(breakOffIndex, this.shortcuts.length - breakOffIndex);
    }

    // If the shortcut that was open got transfered, open the extra shortcuts
    if (this.shortcutOpen >= this.shortcuts.length) {
      this.isExtraShortcutsOpen = true;
    }

    this.showShortcuts = false;
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
              data.elementidentifier, this.collectionToDescription.get(collection).geometry_path,
              this.collectionToDescription.get(collection).centroid_path, collection);
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
      case 'production':
        this.process([data.elementidentifier.idValue], collection);
        break;
    }
  }

  private process(ids: string[], collection: string) {
    const maxItems = this.settingsService.getProcessSettings().max_items;
    if (ids.length <= maxItems) {
      this.processService.load().subscribe({
        next: () => {
          this.processService.getItemsDetail(
            this.collectionToDescription.get(collection).id_path,
            ids,
            this.processService.getProcessDescription().additionalParameters?.parameters,
            collection
          ).subscribe({
            next: (item: any) => {
              this.downloadDialogRef = this.dialog.open(ProcessComponent, { minWidth: '520px', maxWidth: '60vw' });
              this.downloadDialogRef.componentInstance.nbProducts = ids.length;
              this.downloadDialogRef.componentInstance.matchingAdditionalParams = item as Map<string, boolean>;
              this.downloadDialogRef.componentInstance.wktAoi = this.mapService.mapComponent.getAllPolygon('wkt');
              this.downloadDialogRef.componentInstance.ids = ids;
              this.downloadDialogRef.componentInstance.collection = collection;
            }
          });
        }
      });
    } else {
      this.snackbar.open(
        this.translate.instant('You have exceeded the number of products authorised for a single download') + ' (' + maxItems + ')', 'X',
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 5000
        }
      );
    }
  }

  private waitFor(variable, callback) {
    const interval = setInterval(() => {
      if (variable !== undefined) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

