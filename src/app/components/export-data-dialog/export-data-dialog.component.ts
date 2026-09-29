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

import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, Injector, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { DownloadDialogComponent, ShareDialogComponent } from 'arlas-wui-toolkit';
import { OpentelemetryService } from '../../services/opentelemetry.service';

export interface ExportDataDialogConfiguration {
  share: {
    data: Map<string, boolean>;
    enabled: boolean;
  };
  download: {
    data: string;
    enabled: boolean;
  };
}

@Component({
  selector: 'arlas-export-data-dialog',
  imports: [
    MatTabGroup,
    MatTab,
    MatTabContent,
    NgComponentOutlet,
    TranslatePipe
  ],
  templateUrl: './export-data-dialog.component.html',
  styleUrl: './export-data-dialog.component.scss'
})
export class ExportDataDialogComponent implements  OnInit {

  protected dialogData = inject<Array<ExportDataDialogConfiguration>>(MAT_DIALOG_DATA);
  protected componentsConf = signal<{key: string; enabled: boolean; component: any; title: string; injector: any;}[]>([]);
  protected selectedIndex = computed( () => this.componentsConf().findIndex(e => e.enabled));
  private readonly opentelemetryService = inject(OpentelemetryService);

  public ngOnInit() {
    const tabs = Object.keys(this.dialogData)
      .map(key => ({
        key,
        enabled: this.dialogData[key].enabled,
        component: key === 'share' ? ShareDialogComponent : DownloadDialogComponent,
        title: key === 'share' ? marker('Download geo-data') : marker('Download data'),
        injector:  Injector.create({
          providers: [
            {
              provide: MAT_DIALOG_DATA,
              useValue: this.dialogData[key].data
            },
            {
              provide: MatDialogRef,
              useValue: {}
            }
          ]
        })
      }));
    this.componentsConf.set(tabs);

    this.opentelemetryService.sendCustomMessage('form_started', {
      form_id: 'export_data_dialog',
      available_tabs: tabs.filter(t => t.enabled).map(t => t.key)
    });
  }

  public onTabChange(index: number): void {
    const tab = this.componentsConf()[index];
    if (tab) {
      this.opentelemetryService.sendCustomMessage('cta_click', {
        cta_id: 'export_dialog_tab_switch',
        tab_key: tab.key
      });
    }
  }
}
