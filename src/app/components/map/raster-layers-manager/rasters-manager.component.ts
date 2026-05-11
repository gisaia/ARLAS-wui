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

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { CollaborationEvent, OperationEnum } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ActionManagerService } from '../../../services/action-manager.service';
import { CogService } from '../../../services/cog.service';
import { VisualizeService } from '../../../services/visualize.service';

@Component({
  selector: 'arlas-rasters-manager',
  templateUrl: './rasters-manager.component.html',
  styleUrls: ['./rasters-manager.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })), // Initial state when element is not present
      state('*', style({ opacity: 1 })), // Final state when element is present
      transition(':enter', animate('500ms ease-in')), // Animation duration and easing
    ])
  ],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe
  ]
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class RastersManagerComponent<L, S, M> {

  public constructor(
    protected readonly visualizeService: VisualizeService<L, S, M>,
    private readonly collaborativeSearchService: ArlasCollaborativesearchService,
    private readonly cogService: CogService<L, S, M>,
    private readonly actionManager: ActionManagerService
  ) {
    /** Remove the raster once the cross is clicked */
    this.visualizeService.rasterRemoved$.pipe(takeUntilDestroyed()).subscribe({
      next: (id) => {
        this.actionManager.removeItemActions(id, 'visualize');

        // If there are no more rasters on the map, reset the selected cog visualisation
        if (!this.visualizeService.isRasterOnMap()) {
          this.cogService.resetCogVisualisation();
        }
      }
    });

    /** Remove the raster once an arlas filter is applied */
    this.collaborativeSearchService.collaborationBus.pipe(takeUntilDestroyed()).subscribe({
      next: (ce: CollaborationEvent) => {
        if (ce.operation === OperationEnum.add) {
          this.removeLayers();
        }
      }
    });
  }

  /** Removes all raster layers from the map. */
  public removeLayers() {
    this.visualizeService.removeRasters();
    this.actionManager.removeActions('visualize');
    this.cogService.resetCogVisualisation();
  }
}
