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
import { getTitilerPreviewUrl } from 'app/tools/cog';
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
  public preview = input<string>();

  private readonly resultListService = inject(ResultlistService);
  private readonly dialog = inject(MatDialog);

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
    const contributor = this.resultListService.rightListContributors[this.resultListService.selectedListTabIndex];
    const contributorId = contributor.identifier;
    const filters = this.resultListService.getCogFiltersFromConfig(this.resultListService.resultlistConfigPerContId.get(contributorId));
    const dataRetriever = contributor.detailedDataRetriever;

    const itemsVisualized = (new Array(...this.resultListService.activeActionsPerContId.get(contributorId).entries()))
      .filter(v => v[1].has('visualize'));
    const visualizedItemsMatches = zip(itemsVisualized.map(v => dataRetriever.getMatch(v[0], filters)));

    visualizedItemsMatches.subscribe(m => {
      const nbMatches = allVis.map(_ => 0);
      let currentIdx = 0;
      allVis.forEach((v, visIdx) => {
        // For each visualisation, check if each item matches at least one dataGroup
        m.forEach(mi => {
          let isMatched = false;
          v.dataGroups.forEach((dg, dgIdx) => {
            isMatched = isMatched || mi.matched[currentIdx + dgIdx];

            // For titiler protocol, take the first datagroup that matches to create a preview url
            if (mi.matched[currentIdx + dgIdx] && dg.protocol === 'titiler' && !visualisations[visIdx].preview) {
              visualisations[visIdx].preview = getTitilerPreviewUrl(dg.visualisationUrl, mi.data);
            }
          });
          if (isMatched) {
            nbMatches[visIdx] += 1;
          }
        });
        currentIdx += v.dataGroups.length;
      });

      // Transform the number of matches into 'match' description
      nbMatches.forEach((nb, idx) => {
        if (nb === 0) {
          visualisations[idx].match = 'none';
        } else {
          visualisations[idx].match = nb === itemsVisualized.length ? 'all' : 'partial';
        }
      });

      // Update the input data of the dialog
      dialogRef.componentInstance.data = { visualisations, loading: false };

      // Get missing previews by querying with the filters
      visualisations.filter(v => !v.preview).forEach(v => {
        this.resultListService.findPreviewForVisualisation(v, 0);
      });
    });

    dialogRef.afterClosed().pipe(first()).subscribe((v: VisualisationInterface) => {
      const idx = this.resultListService.currentCogVisualisationConfig.findIndex(vis => v === vis);
      this.resultListService.setSelectedCogVisualisation(v, idx, visualisations[idx]?.preview);
    });
  }
}
