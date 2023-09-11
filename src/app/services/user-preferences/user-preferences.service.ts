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

import { Injectable } from '@angular/core';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasSettingsService,
  AuthentificationService, CONFIG_ID_QUERY_PARAM, ContributorBuilder, PersistenceService } from 'arlas-wui-toolkit';
import { AnalyticsSettings, LegendSettings, MapSettings, ResultListSettings,
  TimelineSettings, UserPreferencesSettings } from './models';
import { BasemapStyle, ModeEnum } from 'arlas-web-components';
import { DEFAULT_BASEMAP, ResultListSort, setDefaultResultListColumnSort } from 'app/tools/utils';
import { ResultListContributor } from 'arlas-web-contributors';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

/** Value to suffix user preferences document's id in the persistence */
export const PERSISTENCE_USER_PREFERENCE = 'user_preference';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {

  private _userPreferences: UserPreferencesSettings;

  private dashboardId: string;
  private userPreferencesKey: string;
  private isAuth: boolean;
  private listSort: Map<string, ResultListSort> = new Map();

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
    // Does not work if we use local conf
    this.dashboardId = this.getParamValue(CONFIG_ID_QUERY_PARAM);
    this.userPreferencesKey = this.getUserPreferencesKey();
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
                    console.log('from persistence');
                    return true;
                  });
              } else {
                this._userPreferences = this.getDefaultUserPreferences();
                console.log('default');
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
        console.log(this._userPreferences);
      }
    });
  }

  private getDefaultUserPreferences(): UserPreferencesSettings {
    const analytics = new AnalyticsSettings(
      this.getParamValue('ao') === 'true',
      this.getParamValue('at')
    );

    const vs = this.getParamValue('vs');
    const visibleLayers = {};
    if (vs) {
      const vsKeys = new Set(vs.split(';').map(n => decodeURI(n)));
      vsKeys.forEach(visualisationSet => {
        visibleLayers[visualisationSet] = [];
      });
    }
    const legend = new LegendSettings(
      // Not configurable in URL or conf yet
      true,
      visibleLayers
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
    const defaultTab = this.getParamValue('rt') !== null ? this.getParamValue('rt') : resultlistContributors[0].getName();
    const list = new ResultListSettings(
      this.getParamValue('ro') === 'true',
      // Not configurable in URL or conf yet
      ModeEnum.list,
      // Not configurable in URL or conf yet
      // So default value is first one
      this.listSort.get(resultlistContributors[0].identifier),
      defaultTab
    );

    const mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
    const defaultBaseMap = !!mapComponentConfig.defaultBasemapStyle ? mapComponentConfig.defaultBasemapStyle : DEFAULT_BASEMAP;
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
    if (!queryParams['ao']) {
      queryParams['ao'] = this._userPreferences.analytics.open;
    } else {
      this._userPreferences.analytics.open = queryParams['ao'] === 'true';
    }
    if (!queryParams['at']) {
      queryParams['at'] = this._userPreferences.analytics.at;
    } else {
      this._userPreferences.analytics.at = decodeURI(queryParams['at']);
    }

    // Legend
    if (!queryParams['vs']) {
      // Set vs
    }

    // List
    if (!queryParams['ro']) {
      // Set ro
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
    this.updateUserPreferences();
  }

  public updateListMode(mode: ModeEnum) {
    this._userPreferences.list.mode = mode;
    this.updateUserPreferences();
  }

  public updateListSort(sort: ResultListSort) {
    this._userPreferences.list.sort = sort;
    this.updateUserPreferences();
  }

  public updateSelectedListTab(tab: string) {
    this._userPreferences.list.tab = tab;
    this.updateUserPreferences();
  }


  public updateExtent(extent: string) {
    this._userPreferences.map.extent = extent;
    this.updateUserPreferences();
  }

  public updateBasemap(basemap: BasemapStyle) {
    this._userPreferences.map.basemap = basemap;
    console.log(this._userPreferences);
    this.updateUserPreferences();
  }


  public updateAnalyticsOpen(open: boolean) {
    this._userPreferences.analytics.open = open;
    this.updateUserPreferences();
  }

  public updateAnalyticsTab(tab: string) {
    this._userPreferences.analytics.at = tab;
    this.updateUserPreferences();
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
