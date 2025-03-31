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

import { Component, inject, input } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ResultlistService } from '@services/resultlist.service';
import { CogModalComponent, CogPreviewComponent, CogVisualisationData, VisualisationInterface } from 'arlas-web-components';
import { first, zip } from 'rxjs';

@Component({
  selector: 'arlas-cog-visualisation-manager',
  standalone: true,
  imports: [
    MatIcon,
    CogPreviewComponent,
    MatDialogModule,
    CogModalComponent
  ],
  templateUrl: './cog-visualisation-manager.component.html',
  styleUrl: './cog-visualisation-manager.component.scss'
})
export class CogVisualisationManagerComponent {
  public visualisation = input<VisualisationInterface>();

  private resultListService = inject(ResultlistService);
  private dialog = inject(MatDialog);

  public openModal() {
    const allVis: Array<VisualisationInterface> = this.resultListService.resultlistConfigs[this.resultListService.selectedListTabIndex]
      .input.visualisationsList;

    const visualisations: Array<CogVisualisationData> = allVis.map(v => ({ visualisation: v, match: 'none'}));

    // Open the dialog for selection of visualisation
    // Currently loading
    const dialogRef = this.dialog.open(CogModalComponent, {
      data: {
        visualisations: visualisations,
        loading: true
      },
      width: '44vw',
      maxHeight:'40vh'
    });

    // Query for each of the currently viewed items what visualisations they match
    const contributorId = this.resultListService.rightListContributors[this.resultListService.selectedListTabIndex].identifier;
    const filters = this.resultListService.getCogFiltersFromConfig(this.resultListService.resultlistConfigPerContId.get(contributorId));
    const dataRetriever = this.resultListService.getListComponent().detailedDataRetriever;

    const itemsVisualized = (new Array(...this.resultListService.activeActionsPerContId.get(contributorId).entries()))
      .filter(v => v[1].has('visualize'));
    const visualizedItemsMatches = zip(itemsVisualized.map(v => dataRetriever.getMatch(v[0], filters)));

    visualizedItemsMatches.subscribe(matches => {
      const nbMatches = allVis.map(_ => 0);
      let currentIdx = 0;
      allVis.forEach((v, visIdx) => {
        // For each visualisation, check if each item matches at least one dataGroup
        matches.forEach(match => {
          let isMatched = false;
          v.dataGroups.forEach((dg, dgIdx) => {
            isMatched = isMatched || match[currentIdx + dgIdx];
          });
          if (isMatched) {
            nbMatches[visIdx] += 1;
          }
        });
        currentIdx += v.dataGroups.length;
      });

      // Transform the number of matches into 'match' description
      nbMatches.forEach((nb, idx) => {
        visualisations[idx].match = nb === 0 ? 'none' : (nb === itemsVisualized.length ? 'all' : 'partial');
      });

      // Update the input data of the dialog
      dialogRef.componentInstance.data = { visualisations, loading: false };
    });

    dialogRef.afterClosed().pipe(first()).subscribe(cogStyle =>  {
      this.resultListService.setSelectedCogVisualisation(cogStyle);
    });
  }
}
