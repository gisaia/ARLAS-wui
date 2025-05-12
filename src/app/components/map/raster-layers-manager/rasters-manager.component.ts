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
import { CollaborationEvent, OperationEnum } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { Subject, takeUntil } from 'rxjs';
import { ActionManagerService } from '../../../services/action-manager.service';
import { CogService } from '../../../services/cog.service';
import { VisualizeService } from '../../../services/visualize.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'arlas-rasters-manager',
  templateUrl: './rasters-manager.component.html',
  standalone: false,
  styleUrls: ['./rasters-manager.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })), // Initial state when element is not present
      state('*', style({ opacity: 1 })), // Final state when element is present
      transition(':enter', animate('500ms ease-in')), // Animation duration and easing
    ])
  ]
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class RastersManagerComponent<L, S, M> implements OnInit, OnDestroy {

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  public constructor(
    private readonly visualisationService: VisualizeService<L, S, M>,
    private readonly collaborativeSearchService: ArlasCollaborativesearchService,
    private readonly cogService: CogService<L, S, M>,
    private readonly actionManager: ActionManagerService
  ) { }

  public ngOnInit(): void {
    this.visualisationService.rasterRemoved$.pipe(takeUntil(this._onDestroy$)).subscribe({
      next: (id) => {
        this.actionManager.removeItemActions(id, 'visualize');
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
    this.actionManager.removeActions('visualize');
    this.cogService.setSelectedCogVisualisation(null, 0, '');
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.complete();
  }

}
