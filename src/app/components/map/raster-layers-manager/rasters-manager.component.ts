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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { VisualizeService } from '../../../services/visualize.service';
import { ResultlistService } from '../../../services/resultlist.service';
import { Subject, takeUntil } from 'rxjs';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollaborationEvent, OperationEnum } from 'arlas-web-core';

@Component({
  selector: 'arlas-rasters-manager',
  templateUrl: './rasters-manager.component.html',
  styleUrls: ['./rasters-manager.component.scss']
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class RastersManagerComponent<L, S, M> implements OnInit, OnDestroy {

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  public constructor(
    private readonly visualisationService: VisualizeService,
    private readonly resultlistService: ResultlistService<L, S, M>,
    private readonly collaborativeSearchService: ArlasCollaborativesearchService
  ) { }

  public ngOnInit(): void {
    this.visualisationService.rasterRemoved$.pipe(takeUntil(this._onDestroy$)).subscribe({
      next: (id) => {
        this.resultlistService.removeItemActions(id, 'visualize');
      }
    });
    /** Remove the raster once an arlas filter is applied */
    this.collaborativeSearchService.collaborationBus.pipe(takeUntil(this._onDestroy$)).subscribe({
      next: (ce: CollaborationEvent) => {
        if (ce.operation === OperationEnum.add) {
          this.removeLayers();
        }
      }
    });
  }

  /** Removes all raster layers from the map. */
  public removeLayers() {
    this.visualisationService.removeRasters();
    this.resultlistService.removeActions('visualize');
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.complete();
  }

}
