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
import { DataResource, DataWithLinks } from 'arlas-persistence-api';
import { ArlasColorService } from 'arlas-web-components';
import { ArlasSettingsService, PersistenceService } from 'arlas-wui-toolkit';
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
  @Output() public openHubEventEmitter: Subject<boolean> = new Subject();

  public constructor(
    private persistenceService: PersistenceService,
    private arlasColorService: ArlasColorService,
    private arlasSettingsService: ArlasSettingsService
  ) {
    this.hubUrl = this.arlasSettingsService.getArlasHubUrl();
  }

  public ngOnInit() {
    this.getConfigList();
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
    window.location.search = '?config_id=' + confId;
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
}
