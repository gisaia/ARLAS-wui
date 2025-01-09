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

import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ArlasListComponent } from '@components/arlas-list/arlas-list.component';
import { ArlasWuiMapComponent } from '@components/arlas-map/arlas-map.component';
import { MenuState } from '@components/left-menu/left-menu.component';
import { ContributorService } from '@services/contributors.service';
import { MapWuiService } from '@services/map.service';
import { ResultlistService } from '@services/resultlist.service';
import { Item, ModeEnum } from 'arlas-web-components';
import { SearchContributor } from 'arlas-web-contributors';
import {
  AnalyticsService,
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasMapService,
  ArlasMapSettings,
  ArlasSettingsService,
  ArlasStartupService,
  FilterShortcutConfiguration,
  getParamValue,
  NOT_CONFIGURED,
  TimelineComponent,
  ZoomToDataStrategy
} from 'arlas-wui-toolkit';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'arlas-wui-root',
  templateUrl: './arlas-wui-root.component.html',
  styleUrls: ['./arlas-wui-root.component.scss'],
})
export class ArlasWuiRootComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * @Input : Angular
   * Current version of ARLAS WUI
   */
  @Input() public version: string;

  public searchContributors: SearchContributor[];

  public appName: string;

  // Component config
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;

  public menuState: MenuState = {
    configs: false
  };

  /* Options */
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
  public showIndicators = false;
  public showTimeline = true;
  /**
   * Whether the legend of the timeline is displayed. If both the analytics and the list are open, then the legend is hidden
   */
  public showTimelineLegend = true;
  public zoomToStrategy = ZoomToDataStrategy.NONE;
  public showZoomToData = false;

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
  public collections: string[];
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;
  @ViewChild('arlasMap', { static: false }) public arlasMapComponent: ArlasWuiMapComponent;
  @ViewChild('arlasList', { static: false }) public arlasListComponent: ArlasListComponent;

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

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  public constructor(
    private readonly configService: ArlasConfigService,
    protected settingsService: ArlasSettingsService,
    protected collaborativeService: ArlasCollaborativesearchService,
    private readonly contributorService: ContributorService,
    protected arlasStartupService: ArlasStartupService,
    private readonly mapSettingsService: ArlasMapSettings,
    private readonly cdr: ChangeDetectorRef,
    private readonly toolkitMapService: ArlasMapService,
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    protected analyticsService: AnalyticsService,
    protected resultlistService: ResultlistService,
    protected mapService: MapWuiService
  ) {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      /** resize the map */
      fromEvent(window, 'resize').pipe(debounceTime(100))
        .subscribe((event: Event) => {
          this.resizeCollectionCounts();
          this.adjustVisibleShortcuts();
          this.adjustComponentsSize();
        });

      this.appName = this.configService.appName ?? (this.configService.getValue('arlas-wui.web.app.name') ?? 'ARLAS');

      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');
      this.zoomToStrategy = this.configService.getValue('arlas.web.options.zoom_to_strategy');

      if (this.configService.getValue('arlas.web.options.spinner')) {
        this.spinner = Object.assign(this.spinner, this.configService.getValue('arlas.web.options.spinner'));
      }
      if (
        (!!this.zoomToStrategy && this.zoomToStrategy !== ZoomToDataStrategy.NONE)
        || this.configService.getValue('arlas.web.options.zoom_to_data') // for backward compatibility
      ) {
        this.showZoomToData = true;
      }
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
    }

    /** init from url */
    this.showTimeline = getParamValue('to') === 'true';

    let wasTabSelected = getParamValue('at') !== null;
    this.analyticsService.tabChange.subscribe(tab => {
      // If there is a change in the state of the analytics (open/close), resize
      if (wasTabSelected !== (tab !== undefined)) {
        this.adjustComponentsSize();
        wasTabSelected = (tab !== undefined);
      }
      this.updateTimelineLegendVisibility();
    });
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

    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      this.searchContributors = this.contributorService.getSearchContributors();

      this.collections = [...new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection))];

      this.shortcuts = this.arlasStartupService.filtersShortcuts;

      this.resultlistService.listOpenChange
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(o => {
          this.updateTimelineLegendVisibility();
          this.adjustGrids();
          this.adjustComponentsSize();
          this.adjustVisibleShortcuts();
        });

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

  public ngAfterViewInit(): void {
    if (!this.arlasStartupService.emptyMode) {
      const isListOpen = getParamValue('ro') === 'true';
      if (isListOpen) {
        this.resultlistService.toggleList();
      }
      this.resizeCollectionCounts();
      this.adjustVisibleShortcuts();
      this.adjustComponentsSize();

      // Keep the last displayed list as preview when closing the right panel
      if (!!this.arlasListComponent && !!this.arlasListComponent.tabsList) {
        this.arlasListComponent.tabsList.selectedIndexChange
          .pipe(takeUntil(this._onDestroy$))
          .subscribe(index => {
            this.resultlistService.selectList(index);

            const queryParams = { ...this.activatedRoute.snapshot.queryParams};
            queryParams['rt'] = this.resultlistService.previewListContrib.getName();
            this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
            this.adjustGrids();
            this.adjustComponentsSize();
          });
      }
    }
  }

  public setAppTitle() {
    const prefixTitle = (!!this.settingsService.settings.tab_name && this.settingsService.settings.tab_name !== NOT_CONFIGURED) ?
      this.settingsService.settings.tab_name : '';
    this.titleService.setTitle(prefixTitle === '' ? this.appName :
      prefixTitle.concat(' - ').concat(this.appName));
  }

  public consumeMenuEvents(states: MenuState) {
    this.menuState = states;
  }

  public zoomToData(collection: string): void {
    if (!this.mapSettingsService.mapContributors || this.mapSettingsService.mapContributors.length === 0) {
      this.mapSettingsService.mapContributors = this.mapService.mapContributors;
    }
    let fieldPath: string;
    if (
      this.zoomToStrategy === ZoomToDataStrategy.CENTROID
      || this.configService.getValue('arlas.web.options.zoom_to_data') // for backward compatibility
    ) {
      fieldPath = this.resultlistService.collectionToDescription.get(collection).centroid_path;
    } else if (this.zoomToStrategy === ZoomToDataStrategy.GEOMETRY) {
      fieldPath = this.resultlistService.collectionToDescription.get(collection).geometry_path;
    }
    this.toolkitMapService.zoomToData(collection, fieldPath, this.arlasMapComponent.mapglComponent.map, 0.2);
  }

  public clickOnTile(item: Item) {
    this.arlasListComponent.tabsList.realignInkBar();
    const config = this.resultlistService.resultlistConfigPerContId.get(this.resultlistService.previewListContrib.identifier);
    config.defautMode = ModeEnum.grid;
    config.selectedGridItem = item;
    config.isDetailledGridOpen = true;
    this.resultlistService.resultlistConfigPerContId.set(this.resultlistService.previewListContrib.identifier, config);
    this.toggleList();
  }

  public toggleList() {
    this.arlasListComponent.tabsList.realignInkBar();
    this.resultlistService.toggleList();
  }

  public toggleTimeline() {
    this.showTimeline = !this.showTimeline;
    const queryParams = { ...this.activatedRoute.snapshot.queryParams};
    queryParams['to'] = this.showTimeline + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public updateTimelineLegendVisibility() {
    this.showTimelineLegend = !(this.resultlistService.listOpen && this.analyticsService.activeTab !== undefined);
  }

  public closeAnalytics() {
    this.analyticsService.selectTab(undefined);
  }

  public onOpenShortcut(shortcutState: boolean, shortcutIdx: number) {
    if (shortcutState) {
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
    if (hubUrl) {
      window.open(hubUrl);
    }
  }

  /**
   * Compute the space available between the divider after the search and the title of the application
   */
  private resizeCollectionCounts() {
    const checkElement = async selector => {
      while (document.getElementById(selector) === null) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      return document.getElementById(selector);
    };
    Promise.all([checkElement('menuDivider'), checkElement('title'),]).then((valArray) => {
      // Add padding to the left of the divider and right of the title
      const start = valArray[0].getBoundingClientRect().right + this.spacing;
      const end = valArray[1].getBoundingClientRect().left - this.spacing;
      this.availableSpaceCounts = end - start;
    });
  }

  private adjustGrids() {
    if (!this.resultlistService.listOpen) {
      const config = this.resultlistService.resultlistConfigPerContId.get(this.resultlistService.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    } else {
      this.resultlistService.selectedListTabIndex =
        this.resultlistService.rightListContributors.indexOf(this.resultlistService.previewListContrib);
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
      if (!!this.timelineComponent && !!this.timelineComponent.timelineHistogramComponent) {
        this.timelineComponent.timelineHistogramComponent.resizeHistogram();
        if (this.timelineComponent.detailedTimelineHistogramComponent) {
          this.timelineComponent.detailedTimelineHistogramComponent.resizeHistogram();
        }
      }
      this.mapService.mapComponent?.map?.resize();
      this.mapService.adjustCoordinates();

      this.resultlistService.updateVisibleItems();
    }, 100);
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
    const previewListOpen = !!this.resultlistService.previewListContrib && !this.resultlistService.listOpen
      && this.resultlistService.resultlistConfigPerContId.get(this.resultlistService.previewListContrib.identifier)?.hasGridMode;
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
}
