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

import { Component, Input, OnInit, Output } from '@angular/core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasSettingsService,
  ArlasStartupService,
  ArlasWalkthroughService,
  PersistenceService
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { ArlasWuiMapService } from '../../services/map.service';

export interface MenuState {
  configs?: boolean;
}

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  standalone: false,
  styleUrls: ['./left-menu.component.scss']
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class LeftMenuComponent<L, S, M> implements OnInit {
  /**
   * @Input : Angular
   * List of collections displayed in the map
   */
  @Input() public collections: string[];

  /**
   * @Input : Angular
   * State of the left menu's buttons
   */
  @Input() public toggleStates: MenuState = {
    configs: false
  };
  /**
   * @Input : Angular
   * Whether to show the filter indicators on the Analytics Menu icons
   */
  @Input() public showIndicators: boolean;
  /**
   * @Output : Angular
   * Emits an event when the menu's buttons toggle state changes
   */
  @Output() public menuEventEmitter: Subject<MenuState> = new Subject();


  public zendeskActive = false;

  public isRefreshAnalyticsButton: boolean;
  public showDashboardsList = false;

  public constructor(
    protected walkthroughService: ArlasWalkthroughService,
    private readonly settings: ArlasSettingsService,
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly configService: ArlasConfigService,
    protected arlasStartupService: ArlasStartupService,
    protected persistenceService: PersistenceService,
    private readonly mapService: ArlasWuiMapService<L, S, M>
  ) {
  }

  public ngOnInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.zendeskActive = !!this.settings.getTicketingKey();
      this.isRefreshAnalyticsButton = this.configService.getValue('arlas-wui.web.app.refresh');
    }
    this.showDashboardsList = this.settings.settings.dashboards_shortcut ?? false;
  }

  /**
   * Shows/hides menu element
   */
  public show(element: string) {
    if (element === ('configs')) {
      this.toggleStates.configs = !this.toggleStates.configs;
    } else {
      this.toggleStates.configs = false;
    }
    this.menuEventEmitter.next({ ...this.toggleStates});
  }

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }
}
