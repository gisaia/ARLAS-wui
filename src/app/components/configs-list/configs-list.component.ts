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

import { Component, OnInit, Output } from '@angular/core';
import { UserOrgData } from 'arlas-iam-api';
import { DataResource, DataWithLinks } from 'arlas-persistence-api';
import {
  ArlasAuthentificationService,
  ArlasIamService, ArlasSettingsService, ArlasStartupService,
  AuthentificationService, PersistenceService
} from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';

import { Subject } from 'rxjs';

export const ZONE_WUI_BUILDER = 'config.json';

export interface Configuration {
  id: string;
  name: string;
  color: string;
}

@Component({
  selector: 'arlas-configs-list',
  templateUrl: './configs-list.component.html',
  styleUrls: ['./configs-list.component.scss']
})
export class ConfigsListComponent implements OnInit {
  public configurations: Array<Configuration> = new Array();
  public hubUrl;
  public listResolved = false;
  public retrieveData = true;

  public isAuthentActivated;
  public authentMode = 'false';
  public orgs: UserOrgData[] = [];
  public currentOrg: string;

  @Output() public openHubEventEmitter: Subject<boolean> = new Subject();

  public constructor(
    private persistenceService: PersistenceService,
    private arlasColorService: ArlasColorService,
    private arlasSettingsService: ArlasSettingsService,
    private authentService: AuthentificationService,
    private arlasIamService: ArlasIamService,
    private arlasStartupService: ArlasStartupService,
    private arlasAuthentService: ArlasAuthentificationService
  ) {
    this.hubUrl = this.arlasSettingsService.getArlasHubUrl();
    this.isAuthentActivated = !!this.arlasAuthentService.authConfigValue && !!this.arlasAuthentService.authConfigValue.use_authent;
    this.authentMode = this.arlasAuthentService.authConfigValue.auth_mode;
  }

  public ngOnInit() {

    if (this.authentMode === 'iam') {
      this.arlasIamService.tokenRefreshed$.subscribe({
        next: (userSubject) => {
          if (!!userSubject) {
            this.orgs = userSubject.user.organisations.map(org => {
              org.displayName = org.name === userSubject.user.id ? userSubject.user.email.split('@')[0] : org.name;
              return org;
            });
            this.currentOrg = this.arlasIamService.getOrganisation();
          } else {
            this.orgs = [];
          }
          this.configurations = [];
          this.getConfigList();
        }
      });
    } else {
      this.getConfigList();
    }
  }

  /**
   * Opens the given url in a new tab
   * @param url url to open
   */
  public navigate(url: string) {
    window.open(url, '_blank');
    // emit this event to let know app.component that the component container should be closed
    this.openHubEventEmitter.next(true);
  }

  public switchConf(confId) {
    let url = '?config_id=' + confId;
    const currentOrg = this.arlasIamService.getOrganisation();
    if (!!currentOrg) {
      url += '&org=' + currentOrg;
    }
    window.location.search = url;
  }

  /**
   * Gets the configurations list
   */
  public getConfigList() {
    this.listResolved = false;
    this.persistenceService.list(ZONE_WUI_BUILDER, 10, 1, 'desc')
      .subscribe({
        next: (result: DataResource) => {
          this.listResolved = true;
          if (!!result.data) {
            result.data.forEach((d: DataWithLinks) => {
              const config: Configuration = {
                id: d.id,
                name: d.doc_key,
                color: this.arlasColorService.getColor(d.id.concat(d.doc_key))
              };
              this.configurations.push(config);
            });
          }
        },
        error: (msg) => {
          this.listResolved = true;
          this.retrieveData = false;
        }
      });
  }

  public changeOrg(org: UserOrgData) {
    this.arlasStartupService.changeOrgHeader(org.name, this.arlasIamService.getAccessToken());
    this.configurations = [];
    this.currentOrg = org.name;
    this.getConfigList();
  }
}
