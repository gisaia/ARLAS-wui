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
import { ChipsSearchContributor, MapContributor } from 'arlas-web-contributors';
import { Contributor } from 'arlas-web-core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { Subject } from 'rxjs';

@Injectable()
export class ContributorService {

  public arlasContributors = new Map<string, Contributor>();
  public contributorsIcons = new Map<string, string>();

  public CONTRIBUTORS_PATH = 'arlas.web.contributors';
  public ID_PATH = 'arlas-wui.web.app.idFieldName';
  public DEFAULT_CHART_HEIGHT = 70;
  public MAPCONTRIBUTOR_ID = 'mapbox';
  public CHIPSSEARCH_ID = 'chipssearch';

  public constructor(private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private arlasStartupService: ArlasStartupService
  ) { }

  /* returns the map contributor */
  public getMapContributor(): MapContributor {
    const mapContributorConfig = this.getContributorConfig(this.MAPCONTRIBUTOR_ID);
    let mapglcontributor;
    if (mapContributorConfig !== undefined) {
      mapglcontributor = this.arlasStartupService.contributorRegistry.get(this.MAPCONTRIBUTOR_ID);
      this.arlasContributors.set(this.MAPCONTRIBUTOR_ID, mapglcontributor);
      this.contributorsIcons.set(this.MAPCONTRIBUTOR_ID, mapContributorConfig.icon);
    }
    return mapglcontributor;
  }

  public getChipSearchContributor(): ChipsSearchContributor {
    const chipssearchContributorConfig = this.getContributorConfig(this.CHIPSSEARCH_ID);
    let chipsSearchContributor: ChipsSearchContributor;
    if (chipssearchContributorConfig !== undefined) {
      chipsSearchContributor = this.arlasStartupService.contributorRegistry.get(this.CHIPSSEARCH_ID);
      this.arlasContributors.set(this.CHIPSSEARCH_ID, chipsSearchContributor);
      this.contributorsIcons.set(this.CHIPSSEARCH_ID, chipssearchContributorConfig.icon);
    }
    return chipsSearchContributor;
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

  private getContributorConfig(contributorIdentifier: string) {
    return this.configService.getValue(this.CONTRIBUTORS_PATH).find(
      contrib => (contrib.identifier === contributorIdentifier)
    );
  }

  private getContributorIcon(contributorIdentifier: string) {
    return this.getContributorConfig(contributorIdentifier).icon;
  }
}
