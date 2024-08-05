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
import { CellBackgroundStyleEnum } from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { getParamValue } from 'arlas-wui-toolkit';


@Injectable({
  providedIn: 'root'
})
export class ResultlistService {

  public resultlistContributors: Array<ResultListContributor> = new Array();
  public resultlistConfigs = [];
  public resultlistConfigPerContId = new Map<string, any>();
  public previewlistContrib: ResultListContributor = null;

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
    this.router.navigate([], {replaceUrl: true, queryParams: queryParams});
  }

  public isThumbnailProtected(): boolean {
    return this.resultlistContributors[this.selectedListTabIndex].fieldsConfiguration?.useHttpThumbnails ?? false;
  }
}
