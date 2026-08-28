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

import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Action, ElementIdentifier, GetValuePipe, Item, PageQuery, ResultListComponent, ResultlistModeEnum, SortEnum
} from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { ArlasTaskService } from 'arlas-wui-toolkit';
import { Subject, takeUntil } from 'rxjs';
import { GetResultlistConfigPipe } from '../../pipes/get-resultlist-config.pipe';
import { ActionManagerService } from '../../services/action-manager.service';
import { CogService } from '../../services/cog.service';
import { ResultlistService } from '../../services/resultlist.service';

@Component({
  selector: 'arlas-list',
  templateUrl: './arlas-list.component.html',
  styleUrls: ['./arlas-list.component.scss'],
  imports: [
    MatProgressBarModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    GetResultlistConfigPipe,
    ResultListComponent,
    GetValuePipe
  ]
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ArlasListComponent<L, S, M> implements OnInit, OnDestroy, AfterViewInit {

  /**
   * @Input : Angular
   * @description Width in pixels of the preview result list
   */
  @Input() public previewListWidth = 125;
  /**
   * @Input : Angular
   * @description Width in pixels of the result list
   */
  @Input() public listWidth = 500;
  /**
   * @Input : Angular
   * @description Number of columns in the grid result list
   */
  @Input() public resultListGridColumns = 4;

  @ViewChild('resultList', { static: false }) public resultListComponent?: ResultListComponent;
  @ViewChild('tabsList', { static: false }) public tabsList?: MatTabGroup;

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  protected readonly taskService = inject(ArlasTaskService);
  public constructor(
    protected readonly resultlistService: ResultlistService<L, S, M>,
    private readonly cogService: CogService<L, S, M>,
    protected readonly actionManager: ActionManagerService
  ) { }

  public ngOnInit(): void {
    if (this.resultlistService.previewListContrib) {
      this.cogService.setCogVisualisationConfig(
        this.resultlistService.previewListContrib.identifier,
        this.resultlistService.resultlistConfigPerContId.get(this.resultlistService.previewListContrib.identifier));
    }
  }

  public ngAfterViewInit(): void {
    this.tabsList?.selectedIndexChange?.pipe(takeUntil(this._onDestroy$)).subscribe(e => {
      this.resultlistService.selectedListTabIndex = e;
      if (this.resultlistService.previewListContrib) {
        this.cogService.updateCogVisualisation(
          this.resultlistService.previewListContrib.identifier,
          this.resultlistService.resultlistConfigPerContId.get(this.resultlistService.previewListContrib.identifier));
      }
    });
  }

  public ngOnDestroy(): void {
    this.resultlistService.unsetListComponent();
    this._onDestroy$.next(true);
    this._onDestroy$.complete();
  }

  public onListLoaded(loaded: boolean) {
    const comp = this.resultListComponent;
    if (loaded && comp) {
      setTimeout(() => {
        this.resultlistService.setListComponent(comp);
      }, 0);
    }
  }

  public changeListResultMode(mode: ResultlistModeEnum, identifier: string) {
    const config = this.resultlistService.resultlistConfigPerContId.get(identifier);
    config.defaultMode = mode;
    this.resultlistService.resultlistConfigPerContId.set(identifier, config);
    setTimeout(() => {
      this.resultlistService.updateVisibleItems();
    }, 0);
  }

  public sortColumn(listContributor: ResultListContributor, column: { fieldName: string; sortDirection: SortEnum; }) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'sortColumnEvent', data: column });
  }

  public geoAutoSort(listContributor: ResultListContributor, enabled: boolean) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'geoAutoSortEvent', data: enabled });
  }

  public geoSort(listContributor: ResultListContributor, event: string) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'geoSortEvent', data: event });
  }

  public applyActionOnItem(listContributor: ResultListContributor, action: { action: Action; elementidentifier: ElementIdentifier; }) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'actionOnItemEvent', data: action });
  }

  public consultItem(listContributor: ResultListContributor, data: ElementIdentifier) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'consultedItemEvent', data });
  }

  public selectItems(listContributor: ResultListContributor, data: string[]) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'selectedItemsEvent', data });
  }

  public paginate(listContributor: ResultListContributor, pageQuery: PageQuery) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'paginationEvent', data: pageQuery });
  }

  public applyGlobalAction(listContributor: ResultListContributor, action: Action) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'globalActionEvent', data: action });
  }

  public updateMapStyleFromScroll(items: Item[], collection: string) {
    this.resultlistService.updateMapStyleFromScroll(items, collection);
  }

  public updateMapStyleFromChange(items: Map<string, string>[], collection: string) {
    this.resultlistService.updateMapStyleFromChange(items, collection);
  }

}
