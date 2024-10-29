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
import { ActivatedRoute, Router } from '@angular/router';
import { CellBackgroundStyleEnum, ActionHandler } from 'arlas-web-components';
import { Action, ResultListContributor } from 'arlas-web-contributors';
import { getParamValue } from 'arlas-wui-toolkit';


@Injectable({
  providedIn: 'root'
})
export class ResultlistService {

  public resultlistContributors: Array<ResultListContributor> = new Array();
  public resultlistConfigs = [];
  public resultlistConfigPerContId = new Map<string, any>();
  public previewlistContrib: ResultListContributor = null;
  public activeActionsPerContId = new Map<string, Map<string, Set<string>>>();
  public selectedListTabIndex = 0;
  public listOpen = false;

  public constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    const resultlistOpenString = getParamValue('ro');
    if (resultlistOpenString) {
      this.listOpen = (resultlistOpenString === 'true');
    }
  }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultlistConfigs: string[]) {
    this.resultlistContributors = resultlistContributors;
    if (this.resultlistContributors.length > 0) {
      this.resultlistConfigs = resultlistConfigs;

      this.resultlistConfigs.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultlistConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });
    }
  }

  public toggleList() {
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public isThumbnailProtected(): boolean {
    return this.resultlistContributors[this.selectedListTabIndex].fieldsConfiguration?.useHttpThumbnails ?? false;
  }

  public addAction(contId: string, itemId: string, action: Action) {
    if (ActionHandler.isReversible(action)) {
      if (!this.activeActionsPerContId.get(contId)) {
        this.activeActionsPerContId.set(contId, new Map());
      }
      const activeActions = this.activeActionsPerContId.get(contId);
      if (!activeActions.get(itemId)) {
        activeActions.set(itemId, new Set());
      }
      const actions = activeActions.get(itemId);
      actions.add(action.id);
      this.activeActionsPerContId.set(contId, new Map(activeActions));

    }
  }

  /** Remove an activated action for a given item and given contributor */
  public removeAction(contId: string, itemId: string, actionId: string) {
    if (!this.activeActionsPerContId.get(contId)) {
      return;
    }
    const activeActions = this.activeActionsPerContId.get(contId);
    if (!activeActions.get(itemId)) {
      return;
    }
    const actions = activeActions.get(itemId);
    if (!actions) {
      return;
    }
    actions.delete(actionId);
    this.activeActionsPerContId.set(contId, new Map(activeActions));
  }

  /** Removes an activated action for all items and all contributors */
  public removeActions(actionId: string) {
    if (this.activeActionsPerContId) {
      this.activeActionsPerContId.forEach((actionsPerItem, contId) => {
        actionsPerItem.forEach((actions, itemId) => {
          actions.delete(actionId);
        });
        this.activeActionsPerContId.set(contId, new Map(actionsPerItem));
      });
    }
  }

  /** Removes an activated action for a given item in all contributors */
  public removeItemActions(itemId: string, actionId: string) {
    if (this.activeActionsPerContId) {
      this.activeActionsPerContId.forEach((actionsPerItem, contId) => {
        const actions = actionsPerItem.get(itemId);
        if (!!actions) {
          actions.delete(actionId);
        }
        this.activeActionsPerContId.set(contId, new Map(actionsPerItem));
      });
    }
  }
}
