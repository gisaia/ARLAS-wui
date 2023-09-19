/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Component, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ConfigListAction, ConfigListActionEnum, CustomList, CustomListService } from '../../../services/custom-list.service';
import { DataWithLinks } from 'arlas-persistence-api';
import {
  ArlasConfigService,
  AuthentificationService,
  PersistenceService
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { ArlasColorService } from 'arlas-web-components';



export interface Configuration {
  name: string;
  last_update_date: any;
  actions: Array<ConfigListAction>;
  config: any;
}

@Component({
  selector: 'arlas-custom-config-list',
  templateUrl: './custom-config-list.component.html',
  styleUrls: ['./custom-config-list.component.css']
})
export class CustomConfigListComponent implements OnInit {


  public configurations: Configuration[] = [];
  public displayedColumns: string[] = ['current', 'id', 'creation', 'default', 'detail'];
  public configurationsLength = 0;
  public configPageNumber = 0;
  public configPageSize = 5;

  public isAuthenticated = false;
  public name: string;
  public ZONE = 'config_list';

  @Input() public dashboardId;
  @Output() public clickOnNewConfig: Subject<void> = new Subject();
  public constructor(
    public persistenceService: PersistenceService,
    private authService: AuthentificationService,
    public customListService: CustomListService,
    private colorService: ArlasColorService
  ) {
    this.customListService.refreshListConfig.subscribe(() => this.getConfigList());

  }

  public ngOnInit(): void {
    if (this.persistenceService.isAvailable && !!this.authService.accessToken && this.authService.hasValidAccessToken()) {
      this.getConfigList();
    }
  }

  public ngOnDestroy() {

  }

  public applyInitStyle() {
    this.customListService.currentListConfigId = undefined;
    const columns = this.customListService.initialListConfig.map(c => (
      {
        columnName: c.columnName,
        useColorService: c.useColorService,
        dataType: c.dataType,
        fieldName: c.fieldName,
      })
    );
    const initConfig: CustomList = {
      useAsDefault: false,
      columns,
      keyToColors: this.customListService.initialKeyToColors
    };
    this.customListService.applyListStyle(initConfig);
  };

  public create() {
    this.clickOnNewConfig.next();
  }

  public afterAction(event) {
    if (event.type === ConfigListActionEnum.RENAME || event.type === ConfigListActionEnum.DELETE
      || event.type === ConfigListActionEnum.DUPLICATE) {
      this.getConfigList();
    }
    if (event.type === ConfigListActionEnum.EDIT) {
      this.customListService.openEditResultListConfig(
        JSON.parse(event.config.value),
        event.config.id, this.customListService.getNameFromKey(event.config.name), JSON.parse(event.config.value).useAsDefault);
    }
    if (event.type === ConfigListActionEnum.VIEW) {
      this.customListService.applyListStyle(JSON.parse(event.config.value), event.config.id);
    }
    if (event.type === ConfigListActionEnum.SET_AS_DEFAULT) {
      this.customListService.setAsDefault(event.config.id);
    }
    if (event.type === ConfigListActionEnum.REMOVE_AS_DEFAULT) {
      this.customListService.removeAsDefault(event.config.id);
    }
  }

  public getConfigList() {
    this.persistenceService.list(this.ZONE, this.configPageSize, this.configPageNumber + 1, 'desc')
      .pipe(map(data => {
        if (data.data !== undefined) {
          return [data.total, data.data.filter(d => d.doc_key.indexOf(this.dashboardId) >= 0).map(d => this.computeData(d))];
        } else {
          return [data.total, []];
        }
      }))
      .subscribe({
        next: (result) => {
          this.configurationsLength = result[0] as number;
          this.configurations = result[1] as Configuration[];
        },
        error: (msg) => {
          let message = '';
          if (msg.url) {
            message =
              '- An ARLAS-persistence error occured: ' + (msg.status === 404 ? 'unreachable server \n' : 'unauthorized access \n') +
              '   - url: ' + msg.url + '\n' + '   - status : ' + msg.status;
          } else {
            message = msg.toString();
          }
          const error = {
            origin: 'ARLAS-persistence',
            message,
            reason: (msg.status === 404 || msg.toString().includes('Failed to fetch') ?
              'Please check if ARLAS-persistence server is up & running,' +
              ' and that you have access to the asked endpoint' :
              'Please check if you\'re authenticated to have access to ARLAS-persistence server')
          };
        }
      });
  }
  private computeData(data: DataWithLinks): Configuration {
    const actions: Array<ConfigListAction> = new Array();
    const config = {
      id: data.id,
      name: data.doc_key,
      value: data.doc_value,
      readers: data.doc_readers,
      writers: data.doc_writers,
      lastUpdate: +data.last_update_date,
      zone: data.doc_zone,
      isDefault: JSON.parse(data.doc_value).useAsDefault
    };
    actions.push({
      config,
      configIdParam: this.ZONE,
      type: ConfigListActionEnum.VIEW
    });
    actions.push({
      config,
      type: ConfigListActionEnum.EDIT,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigListActionEnum.RENAME,
      name: data.doc_key,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigListActionEnum.DUPLICATE,
      name: data.doc_key
    });
    actions.push({
      config,
      type: ConfigListActionEnum.SHARE,
      enabled: data.updatable

    });
    actions.push({
      config,
      type: ConfigListActionEnum.DELETE,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigListActionEnum.SET_AS_DEFAULT,
      enabled: data.updatable,
      displayed: !JSON.parse(data.doc_value).useAsDefault
    });
    actions.push({
      config,
      type: ConfigListActionEnum.REMOVE_AS_DEFAULT,
      enabled: data.updatable,
      displayed: JSON.parse(data.doc_value).useAsDefault
    });

    return {
      config: config,
      name: data.doc_key,
      last_update_date: data.last_update_date,
      actions
    };
  }
  public pageChange(pageEvent: PageEvent) {
    this.configPageNumber = pageEvent.pageIndex;
    this.configPageSize = pageEvent.pageSize;
    this.getConfigList();
  }
}






