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


import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AboutComponent,
  ArlasConfigService,
  ArlasStartupService,
  ArlasWalkthroughService,
  DownloadComponent,
  ShareComponent,
  TagComponent
} from 'arlas-wui-toolkit';
import { ArlasWuiMapService } from '../../services/map.service';

@Component({
  selector: 'arlas-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrl: './action-menu.component.scss'
})
export class ActionMenuComponent implements OnInit{

  /**
   * @Input : Angular
   * List of collections displayed in the map
   */
  public collections = input<string[]>([]);
  public showAboutButton = input<boolean>(true);
  /**
   * @Input : Angular
   * @description Version of the WUI to display as info
   */
  public version = input<string>('');

  /**
   * @Input : Angular
   * @description Name of the WUI in which the bar is used
   */
  public wuiName= input<string>('');


  @ViewChild('share', { static: false }) private readonly shareComponent: ShareComponent;
  @ViewChild('download', { static: false }) private readonly downloadComponent: DownloadComponent;
  @ViewChild('tag', { static: false }) private readonly tagComponent: TagComponent;
  @ViewChild('about', { static: false }) private readonly aboutcomponent: AboutComponent;

  public tagComponentConfig: any;
  public shareComponentConfig: any;
  public downloadComponentConfig: any;
  public aboutFile: string;
  public extraAboutText: string;

  protected walkthroughService = inject(ArlasWalkthroughService);
  protected mapService = inject(ArlasWuiMapService);
  protected arlasStartupService = inject(ArlasStartupService);
  protected configService = inject(ArlasConfigService);
  protected translate = inject(TranslateService);

  public constructor() {
    this.extraAboutText = this.translate.instant('extraAboutText') === 'extraAboutText' ? '' : this.translate.instant('extraAboutText');
    this.aboutFile = 'assets/about/about_' + this.translate.currentLang + '.md?' + Date.now() + '.md';
  }

  public ngOnInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
      this.downloadComponentConfig = this.configService.getValue('arlas.web.components.download');
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
    }
  }


  /** When opening the dialog of layers to share, we specify the visibility status of all
   * layers so that we choose only the displayed ones */
  public displayShare() {
    this.shareComponent.openDialog(this.mapService.mapComponent.visibilityStatus);
  }

  public replayTour() {
    this.walkthroughService.resetTour();
    this.walkthroughService.startTour();
  }

  public displayDownload() {
    this.downloadComponent.openDialog();
  }

  public displayTag() {
    this.tagComponent.openDialog();
  }

  public displayAbout() {
    this.aboutcomponent.openDialog();
  }

  public displayTagManagement() {
    this.tagComponent.openManagement();
  }
}


