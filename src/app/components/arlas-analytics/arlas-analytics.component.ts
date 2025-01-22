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

import { Component, Input, OnInit } from '@angular/core';
import { ResultlistService } from '@services/resultlist.service';
import { AnalyticsContributor } from 'arlas-web-contributors';
import { AnalyticsService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';

@Component({
  selector: 'arlas-analytics',
  templateUrl: './arlas-analytics.component.html',
  standalone: false,
  styleUrls: ['./arlas-analytics.component.scss']
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ArlasAnalyticsComponent<L, S, M> implements OnInit {
  /**
   * @Input : Angular
   * Whether to show the analytics menu inside of this component. Useful for multi-windows views
   */
  @Input() public showMenu = false;

  public analyticsContributor: AnalyticsContributor;
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; };
  public showIndicators = false;

  public constructor(
    protected analyticsService: AnalyticsService,
    protected arlasStartupService: ArlasStartupService,
    private readonly configService: ArlasConfigService,
    protected resultlistService: ResultlistService<L, S, M>
  ) {
  }

  public ngOnInit(): void {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      this.setSpinner();
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
    }
  }

  private setSpinner() {
    const spinnerConfiguration = this.configService.getValue('arlas.web.options.spinner');
    if (!!spinnerConfiguration) {
      this.spinner = spinnerConfiguration;
    } else {
      this.spinner = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
    }
  }
}
