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

import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasSettingsService,
  AuthentificationService, CONFIG_ID_QUERY_PARAM, ContributorBuilder, PersistenceService
} from 'arlas-wui-toolkit';
import {
  AnalyticsSettings, LegendSettings, MapSettings, ResultListSettings,
  TimelineSettings, UserPreferencesSettings
} from './models';
import { BasemapStyle, ModeEnum } from 'arlas-web-components';
import { DEFAULT_BASEMAP, ResultListSort, setDefaultResultListColumnSort } from 'app/tools/utils';
import { ResultListContributor } from 'arlas-web-contributors';
import { debounceTime, firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

/** Value to suffix user preferences document's id in the persistence */
export const PERSISTENCE_USER_PREFERENCE = 'user_preference';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService implements OnDestroy {

  private UPDATE_DEBOUNCE_TIME = 100;

  private _userPreferences: UserPreferencesSettings;

  private dashboardId: string;
  private userPreferencesKey: string;
  private isAuth: boolean;
  private listSort: Map<string, ResultListSort> = new Map();
  private isUpdateEmitter: EventEmitter<void> = new EventEmitter();

  public isLoaded: boolean;

  public constructor(
    private persistenceService: PersistenceService,
    private authService: AuthentificationService,
    private configService: ArlasConfigService,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private settingsService: ArlasSettingsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.dashboardId = !!this.getParamValue(CONFIG_ID_QUERY_PARAM) ? this.getParamValue(CONFIG_ID_QUERY_PARAM) : 'local';
    this.userPreferencesKey = this.getUserPreferencesKey();

    this.isUpdateEmitter.pipe(debounceTime(this.UPDATE_DEBOUNCE_TIME)).subscribe(() => {
      this.updateUserPreferences();
    });
  }

  // On destroy, save the latest version of the configuration
  public ngOnDestroy(): void {
    this.updateUserPreferences();
  }

  public load() {
    if (!this.dashboardId) {
      this.isLoaded = false;
      return Promise.resolve();
    }
    const ret = firstValueFrom(this.authService.isAuthenticated)
      .then((isAuth) => {
        this.isAuth = isAuth;
        if (this.isAuth) {
          return firstValueFrom(this.persistenceService.existByZoneKey(PERSISTENCE_USER_PREFERENCE, this.userPreferencesKey))
            .then((e) => {
              if (e.exists) {
                return firstValueFrom(this.persistenceService.getByZoneKey(PERSISTENCE_USER_PREFERENCE, this.userPreferencesKey))
                  .then((data) => {
                    this._userPreferences = JSON.parse(data.doc_value);
                    return true;
                  });
              } else {
                this._userPreferences = this.getDefaultUserPreferences();
                // eslint-disable-next-line max-len
                return firstValueFrom(this.persistenceService.create(PERSISTENCE_USER_PREFERENCE, this.userPreferencesKey, JSON.stringify(this._userPreferences)))
                  .then(() => true);
              }
            });
        } else {
          return false;
        }
      });
    return ret.then((isLoaded) => {
      this.isLoaded = isLoaded;
      if (isLoaded) {
        this.updateUrl();
      }
    });
  }

  private getDefaultUserPreferences(): UserPreferencesSettings {
    const defaultAnalyticsTab = this.getParamValue('at') !== null ? this.getParamValue('at') :
      !!this.configService.getValue('arlas.web.options.tabs') && this.configService.getValue('arlas.web.options.tabs').length > 0
        ? this.configService.getValue('arlas.web.options.tabs')[0].name : '';
    const analytics = new AnalyticsSettings(
      this.getParamValue('ao') === 'true',
      defaultAnalyticsTab
    );

    const defaultVs = this.getParamValue('vs') !== null ? this.getParamValue('vs') :
      this.configService.getValue('arlas.web.components.mapgl.input.visualisations_sets').filter(vs => vs.enabled).map(vs => vs.name).join(';');
    const legend = new LegendSettings(
      // Not configurable in URL or conf yet
      true,
      {},
      defaultVs
    );

    const resultlistContributors = new Array<ResultListContributor>();
    this.configService.getValue('arlas.web.contributors').forEach(contConfig => {
      const contributorType = contConfig.type;
      const contributorIdentifier = contConfig.identifier;
      if (contributorType === 'resultlist') {
        const contributor = ContributorBuilder.buildContributor(contributorType,
          contributorIdentifier,
          this.configService,
          this.collaborativesearchService,
          this.settingsService);
        resultlistContributors.push(contributor);
      }
    });
    const resultlistConfigs = this.configService.getValue('arlas.web.components.resultlists');
    setDefaultResultListColumnSort(resultlistContributors, resultlistConfigs, this.listSort);
    const defaultTab = this.getParamValue('rt') !== null ? this.getParamValue('rt') :
      resultlistContributors.length > 0 ? resultlistContributors[0].getName() : '';
    const listModeMap: Record<string, ModeEnum> = {};

    if (resultlistConfigs) {
      resultlistConfigs.forEach(c => {
        listModeMap[c.contributorId] = c.input.defautMode;
      });
    }

    const list = new ResultListSettings(
      this.getParamValue('ro') === 'true',
      // Not configurable in URL or conf yet
      listModeMap,
      // Not configurable in URL or conf yet
      Object.fromEntries(this.listSort),
      defaultTab
    );

    const mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
    const defaultBaseMap = (!!mapComponentConfig && !!mapComponentConfig.defaultBasemapStyle) ?
      mapComponentConfig.defaultBasemapStyle : DEFAULT_BASEMAP;
    const map = new MapSettings(
      this.getParamValue('extend'),
      defaultBaseMap
    );

    const timeline = new TimelineSettings(
      // Not configurable in URL or conf yet
      true
    );

    return new UserPreferencesSettings(analytics, legend, list, map, timeline);
  }

  private updateUrl() {
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    // Analytics
    queryParams[CONFIG_ID_QUERY_PARAM] = this.dashboardId;
    if (!queryParams['ao']) {
      queryParams['ao'] = this._userPreferences.analytics.open;
    } else {
      this._userPreferences.analytics.open = queryParams['ao'] === 'true';
    }
    if (!queryParams['at']) {
      queryParams['at'] = this._userPreferences.analytics.tab;
    } else {
      this._userPreferences.analytics.tab = decodeURI(queryParams['at']);
    }

    // Legend
    if (!queryParams['vs']) {
      queryParams['vs'] = this._userPreferences.legend.vs;
    } else {
      this._userPreferences.legend.vs = decodeURI(queryParams['vs']);
    }

    // List
    if (!queryParams['ro']) {
      queryParams['ro'] = this._userPreferences.list.open;
    } else {
      this._userPreferences.list.open = queryParams['ro'] === 'true';
    }
    if (!queryParams['rt']) {
      queryParams['rt'] = this._userPreferences.list.tab;
    } else {
      this._userPreferences.list.tab = decodeURI(queryParams['rt']);
    }

    // Map
    if (!queryParams['extend']) {
      queryParams['extend'] = this._userPreferences.map.extent;
    } else {
      this._userPreferences.map.extent = queryParams['extend'];
    }
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  private updateUserPreferences() {
    if (this.isAuth && this._userPreferences) {
      this.persistenceService.existByZoneKey(PERSISTENCE_USER_PREFERENCE, this.userPreferencesKey).subscribe({
        next: (e) => {
          if (e.exists) {
            this.persistenceService.getByZoneKey(PERSISTENCE_USER_PREFERENCE, this.userPreferencesKey).subscribe({
              next: (data) => {
                this.persistenceService.update(data.id, JSON.stringify(this._userPreferences),
                  new Date(data.last_update_date).getTime(), this.userPreferencesKey);
              }
            });
          }
        }
      });
    }
  }

  public updateListOpen(isOpen: boolean) {
    this._userPreferences.list.open = isOpen;
    this.isUpdateEmitter.next();
  }

  public updateListMode(listId: string, mode: ModeEnum) {
    this._userPreferences.list.mode[listId] = mode;
    this.isUpdateEmitter.next();
  }

  public updateListSort(listId: string, sort: ResultListSort) {
    // Add this decomposition of the ResultListSort, to avoid storing too much information
    this._userPreferences.list.sort[listId] = { fieldName: sort.fieldName, sortDirection: sort.sortDirection, columnName: sort.columnName };
    this.isUpdateEmitter.next();
  }

  public updateSelectedListTab(tab: string) {
    this._userPreferences.list.tab = tab;
    this.isUpdateEmitter.next();
  }


  public updateExtent(extent: string) {
    this._userPreferences.map.extent = extent;
    this.isUpdateEmitter.next();
  }

  public updateBasemap(basemap: BasemapStyle) {
    this._userPreferences.map.basemap = basemap;
    this.isUpdateEmitter.next();
  }


  public updateAnalyticsOpen(open: boolean) {
    this._userPreferences.analytics.open = open;
    this.isUpdateEmitter.next();
  }

  public updateAnalyticsTab(tab: string) {
    this._userPreferences.analytics.tab = tab;
    this.isUpdateEmitter.next();
  }

  public updateLegendOpen(isOpen: boolean) {
    this._userPreferences.legend.open = isOpen;
    this.isUpdateEmitter.next();
  }

  public updateLegendDetail(layerName: string, vsName: string, isOpen: boolean) {
    if (this._userPreferences.legend.layersDetails[vsName]) {
      this._userPreferences.legend.layersDetails[vsName][layerName] = isOpen;
    } else {
      this._userPreferences.legend.layersDetails[vsName] = { [layerName]: isOpen };
    }
    this.isUpdateEmitter.next();
  }

  /**
   * @param concatenatedVs Concatenated names of the visualisation sets separated by ';'
   */
  public updateVisualisationSets(concatenatedVs: string) {
    this._userPreferences.legend.vs = concatenatedVs;
    this.isUpdateEmitter.next();
  }

  public updateTimelineOpen(isOpen: boolean) {
    this._userPreferences.timeline.open = isOpen;
    this.isUpdateEmitter.next();
  }

  public get userPreferences() {
    return this._userPreferences;
  }

  private getParamValue(param: string): string | null {
    let paramValue = null;
    const url = window.location.href;
    const regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (results && results[2]) {
      paramValue = results[2];
    }
    return paramValue;
  }

  private getUserPreferencesKey(): string {
    return this.dashboardId + '_' + PERSISTENCE_USER_PREFERENCE;
  }
}
