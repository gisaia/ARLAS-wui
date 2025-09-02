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

import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasSettingsService,
  ArlasStartupService,
  ArlasWalkthroughService,
  PersistenceService,
  TagComponent
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';

export interface MenuState {
  configs?: boolean;
}

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
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

  @ViewChild('tag', { static: false }) private readonly tagComponent: TagComponent;

  public tagComponentConfig: any;

  public zendeskActive = false;

  public isRefreshAnalyticsButton: boolean;
  public showDashboardsList = false;

  public constructor(
    private readonly walkthroughService: ArlasWalkthroughService,
    private readonly settings: ArlasSettingsService,
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly configService: ArlasConfigService,
    protected arlasStartupService: ArlasStartupService,
    protected persistenceService: PersistenceService
  ) {
  }

  public ngOnInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
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

  public replayTour() {
    this.walkthroughService.resetTour();
    this.walkthroughService.startTour();
  }

  public displayTag() {
    this.tagComponent.openDialog();
  }

  public displayTagManagement() {
    this.tagComponent.openManagement();
  }
}
