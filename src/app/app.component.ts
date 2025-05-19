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
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CollectionReferenceParameters } from 'arlas-api';
import { ArlasMapFrameworkService } from 'arlas-map';
import { ArlasColorService } from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { AnalyticsService, ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { Subject, takeUntil, zip } from 'rxjs';
import { CogService } from './services/cog.service';
import { ContributorService } from './services/contributors.service';
import { ArlasWuiMapService } from './services/map.service';
import { ResultlistService } from './services/resultlist.service';

@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss']
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ArlasWuiComponent<L, S, M> implements OnInit, OnChanges {

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
    private readonly cogService: CogService<L, S, M>
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
          cdrs.forEach(cdr => {
            collectionToDescription.set(cdr.collection_name, cdr.params);
          });
          this.contributorService.setCollectionsDescription(collectionToDescription);
          if (this.resultlistService.resultlistContributors.length > 0) {
            this.resultlistService.resultlistContributors.forEach(c => c.sort = collectionToDescription.get(c.collection).id_path);
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
    this.arlasStartupService.contributorRegistry.forEach((v, k) => {
      if (v instanceof ResultListContributor) {
        v.updateData = ids.has(v.identifier);
        resultlistContributors.push(v);
      }
    });
    this.resultlistService.setContributors(resultlistContributors, resultListsConfig);
  }

  private initializeMap() {
    const mapContributors = [];
    this.contributorService.getMapContributors().forEach(mapContrib => {
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
    });
    this.mapService.setContributors(mapContributors);
  }

  private initializeAnalytics() {
    const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
    const allAnalytics = this.arlasStartupService.analytics;
    this.analyticsService.initializeGroups((allAnalytics ?? []).filter(a => !hiddenAnalyticsTabsSet.has(a.tab)));
  }
}
