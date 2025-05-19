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
import { CollectionReferenceParameters } from 'arlas-api';
import { MapContributor, SearchContributor } from 'arlas-web-contributors';
import { Contributor } from 'arlas-web-core';
import { ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';

@Injectable()
export class ContributorService {
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();

  public arlasContributors = new Map<string, Contributor>();
  public contributorsIcons = new Map<string, string>();

  public CONTRIBUTORS_PATH = 'arlas.web.contributors';
  public ID_PATH = 'arlas-wui.web.app.idFieldName';
  public DEFAULT_CHART_HEIGHT = 70;
  public SEARCH_TYPE = 'search';

  public constructor(
    private readonly configService: ArlasConfigService,
    private readonly arlasStartupService: ArlasStartupService
  ) { }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public getMapContributors(): Array<MapContributor> {
    const mapContributorsConfig = this.getMapContributorConfigs();
    const mapcontributors = new Array<MapContributor>();
    if (mapContributorsConfig !== undefined) {
      mapContributorsConfig
        .forEach(config => {
          const contrib = this.arlasStartupService.contributorRegistry.get(config.identifier) as MapContributor;

          this.arlasContributors.set(config.identifier, contrib);
          this.contributorsIcons.set(config.identifier, config.icon);
          mapcontributors.push(contrib);
        });
    }
    return mapcontributors;
  }

  public getSearchContributors(): Array<SearchContributor> {
    const searchContributorsConfig = this.getSearchContributorsConfigs();
    const searchContributors = new Array<SearchContributor>();
    if (searchContributorsConfig !== undefined) {
      searchContributorsConfig
        .forEach((config: { identifier: string; icon: string; }) => {
          const contrib = this.arlasStartupService.contributorRegistry.get(config.identifier) as SearchContributor;

          this.arlasContributors.set(config.identifier, contrib);
          this.contributorsIcons.set(config.identifier, config.icon);
          searchContributors.push(contrib);
        });
    }
    return searchContributors;
  }

  public getArlasContributors(): Map<string, Contributor> {
    return this.arlasContributors;
  }

  public getContributor(contributorId: string): Contributor {
    return this.arlasContributors.get(contributorId);
  }

  public getAllContributorsIcons(): Map<string, string> {
    this.arlasStartupService.contributorRegistry.forEach((v, k) => {
      if (v !== undefined) {
        this.contributorsIcons.set(
          k,
          this.configService.getValue(this.CONTRIBUTORS_PATH).find(contrib => contrib.identifier === k).icon
        );
      }
    });
    return this.contributorsIcons;
  }

  private getMapContributorConfigs() {
    return this.arlasStartupService.emptyMode ? undefined : this.configService.getValue('arlas')['web']['contributors'].filter(
      contrib => (contrib.type === 'map')
    );
  }

  private getSearchContributorsConfigs() {
    return this.arlasStartupService.emptyMode ? undefined : !!this.configService.getValue('arlas') ?
      this.configService.getValue('arlas')['web']['contributors'].filter(
        (contrib: { type: string; }) => (contrib.type === this.SEARCH_TYPE || contrib.type === 'chipssearch')) : undefined;
  }
}
