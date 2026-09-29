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
import { Component, DestroyRef, HostListener, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { CollectionReferenceParameters } from 'arlas-api';
import { ArlasMapFrameworkService } from 'arlas-map';
import { ArlasColorService } from 'arlas-web-components';
import { CollaborationEvent, OperationEnum } from 'arlas-web-core';
import { ResultListContributor } from 'arlas-web-contributors';
import { AnalyticsService, ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService, ErrorService } from 'arlas-wui-toolkit';
import { LAZYLOAD_IMAGE_HOOKS } from 'ng-lazyload-image';
import { Subject, takeUntil, zip } from 'rxjs';
import { ContributorService } from './services/contributors.service';
import { ArlasWuiMapService } from './services/map.service';
import { OpentelemetryService } from './services/opentelemetry.service';
import { ResultlistService } from './services/resultlist.service';
import { LazyLoadImageHooks } from './tools/lazy-loader';

@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet
  ],
  providers: [
    // Provide lazyload hook here to override the lib built-in one
    {
      provide: LAZYLOAD_IMAGE_HOOKS,
      useClass: LazyLoadImageHooks
    }
  ]
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ArlasWuiComponent<L, S, M> implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  public collections = new Array<string>();
  /**
   * @Input : Angular
   * List of ResultList tabs to hide
   */
  @Input() public hiddenResultlistTabs: string[] = [];
  /**
   * @Input : Angular
   * List of Analytics tabs to hide
   */
  @Input() public hiddenAnalyticsTabs: string[] = [];

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  public constructor(
    private readonly arlasStartupService: ArlasStartupService,
    private readonly configService: ArlasConfigService,
    private readonly resultlistService: ResultlistService<L, S, M>,
    private readonly contributorService: ContributorService,
    private readonly mapService: ArlasWuiMapService<L, S, M>,
    private readonly mapFrameworkService: ArlasMapFrameworkService<L, S, M>,
    private readonly colorService: ArlasColorService,
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly analyticsService: AnalyticsService,
    private readonly errorService: ErrorService,
    private readonly opentelemetryService: OpentelemetryService
  ) {

    // Initialize the contributors and app wide services
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      this.collections = [...new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection))];

      /** Resultlist */
      this.initializeResultlist();
      /** Map */
      this.initializeMap();
      /** Analytics */
      this.initializeAnalytics();

      /** Resultlist-Map interactions */
      this.resultlistService.setMapListInteractions();

      /** Listen to map errors */
      this.mapFrameworkService.errorBus$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(e => {
          // Only configuration errors are sent for now
          this.errorService.emitInvalidDashboardError(true, e);
        });

      /** Listen to collaborations for Core Feature metrics & Aha moment */
      this.collaborativeService.collaborationBus
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(ce => {
          this.trackCollaborationTelemetry(ce);
        });
    }
  }

  public ngOnInit(): void {
    const loadingGif = document.querySelector('.gif');
    if (loadingGif) {
      loadingGif.remove();
    }

    // Initialize the contributors and app wide services
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      if (this.mapService.mapComponent) {
        this.mapFrameworkService.fitMapBounds(this.mapService.mapComponent.map);
      }

      const collectionToDescription = new Map<string, CollectionReferenceParameters>();
      zip(...this.collections.map(c => this.collaborativeService.describe(c)))
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(cdrs => {
          for (const cdr of cdrs) {
            collectionToDescription.set(cdr.collection_name, cdr.params);
          }
          this.contributorService.setCollectionsDescription(collectionToDescription);
          if (this.resultlistService.resultlistContributors.length > 0) {
            for (const c of this.resultlistService.resultlistContributors) {
              c.sort = collectionToDescription.get(c.collection).id_path;
            }
          }
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['hiddenResultlistTabs']?.currentValue !== changes['hiddenResultlistTabs']?.previousValue) {
      this.initializeResultlist();
      // Based on which resultlist are defined, there could be a change in the sort of map elements
      this.initializeMap();
    }
    if (changes['hiddenAnalyticsTabs']?.currentValue !== changes['hiddenAnalyticsTabs']?.previousValue) {
      this.initializeAnalytics();
    }
  }

  private initializeResultlist() {
    const hiddenListsTabsSet = new Set(this.hiddenResultlistTabs);
    const allResultlists = this.configService.getValue('arlas.web.components.resultlists');
    const allContributors = this.configService.getValue('arlas.web.contributors');
    const resultListsConfig = (allResultlists ?? []).filter(a => {
      const contId = a.contributorId;
      const tab = allContributors.find(c => c.identifier === contId).name;
      return !hiddenListsTabsSet.has(tab);
    });

    const ids = new Set(resultListsConfig.map(c => c.contributorId));
    const resultlistContributors = new Array<ResultListContributor>();
    for (const v of this.arlasStartupService.contributorRegistry.values()) {
      if (v instanceof ResultListContributor) {
        v.updateData = ids.has(v.identifier);
        resultlistContributors.push(v);
      }
    }
    this.resultlistService.setContributors(resultlistContributors, resultListsConfig);
  }

  private initializeMap() {
    const mapContributors = [];
    for (const mapContrib of this.contributorService.getMapContributors()) {
      mapContrib.colorGenerator = this.colorService.colorGenerator;
      if (this.resultlistService.resultlistContributors) {
        const resultlistContrbutor: ResultListContributor = this.resultlistService.resultlistContributors
          .find(resultlistContrib => resultlistContrib.collection === mapContrib.collection);
        if (resultlistContrbutor) {
          mapContrib.searchSize = resultlistContrbutor.pageSize;
          mapContrib.searchSort = resultlistContrbutor.sort;
        } else {
          mapContrib.searchSize = 50;
        }
      }
      mapContributors.push(mapContrib);
    }
    this.mapService.setContributors(mapContributors);
  }

  private initializeAnalytics() {
    const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
    const allAnalytics = this.arlasStartupService.analytics;
    this.analyticsService.initializeGroups((allAnalytics ?? []).filter(a => !hiddenAnalyticsTabsSet.has(a.tab)));
  }

  private hasTriggeredAhaMoment = false;

  private trackCollaborationTelemetry(ce: CollaborationEvent): void {
    this.opentelemetryService.sendCustomMessage('core_feature_used', {
      feature: 'collaboration_filter',
      contributor_id: ce.id,
      operation: ce.operation
    });

    if (!this.hasTriggeredAhaMoment && ce.operation === OperationEnum.add) {
      const collaborations = Array.from(this.collaborativeService.collaborations.keys());
      const hasSpatial = collaborations.some(id => id.startsWith('map') || id.includes('bbox') || id.includes('geometry'));
      const hasTemporalOrAnalytic = collaborations.some(id =>
        id.startsWith('timeline') || id.includes('date') || id.includes('histo') || id.includes('analytics')
      );

      if (hasSpatial && hasTemporalOrAnalytic) {
        this.hasTriggeredAhaMoment = true;
        this.opentelemetryService.sendCustomMessage('user_activation_aha_moment', {
          activation_type: 'spatial_and_temporal_crossfilter',
          contributor_trigger_id: ce.id,
          total_collaborations: collaborations.length
        });
      }
    }
  }

  private clickHistory: { time: number; x: number; y: number; }[] = [];
  private lastRageClickSent = 0;

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const now = Date.now();
    const x = event.clientX;
    const y = event.clientY;

    // Retain clicks within the last 800ms window
    this.clickHistory = this.clickHistory.filter(c => now - c.time <= 800);
    this.clickHistory.push({ time: now, x, y });

    if (this.clickHistory.length >= 3) {
      const first = this.clickHistory[0];
      const isWithinRadius = this.clickHistory.every(c => Math.hypot(c.x - first.x, c.y - first.y) <= 30);

      // Debounce rage click events (minimum 1s between successive alerts)
      if (isWithinRadius && (now - this.lastRageClickSent > 1000)) {
        this.lastRageClickSent = now;
        const target = event.target as HTMLElement | null;
        this.opentelemetryService.sendCustomMessage('rage_click_detected', {
          click_count: this.clickHistory.length,
          target_tag: target?.tagName?.toLowerCase() ?? 'unknown',
          target_class: target?.className ?? '',
          target_id: target?.id ?? '',
          x,
          y
        });
        this.clickHistory = [];
      }
    }
  }
}
