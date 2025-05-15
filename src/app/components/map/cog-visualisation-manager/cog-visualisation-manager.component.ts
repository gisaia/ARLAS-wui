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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CogPreviewComponent, CogVisualisationData, MatchInfo, VisualisationInterface } from 'arlas-web-components';
import { first, zip } from 'rxjs';
import { ActionManagerService } from '../../../services/action-manager.service';
import { CogService } from '../../../services/cog.service';
import { ResultlistService } from '../../../services/resultlist.service';

@Component({
  selector: 'arlas-cog-visualisation-manager',
  standalone: true,
  imports: [
    CogPreviewComponent,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './cog-visualisation-manager.component.html',
  styleUrl: './cog-visualisation-manager.component.scss'
})
export class CogVisualisationManagerComponent {
  public visualisation = input<VisualisationInterface>();
  public preview = input<string>();

  private readonly resultListService = inject(ResultlistService);
  private readonly cogService = inject(CogService);
  private readonly actionManager = inject(ActionManagerService);

  public openModal() {
    const currentVisualisation = this.cogService.getCurrentVisualisation().visualisation;

    const visualisations: Array<CogVisualisationData> = this.cogService.currentCogVisualisationConfig
      .map((v, idx) => ({
        visualisation: v, match: 'none', preview: this.cogService.getDefaultPreview(idx), selected: v === currentVisualisation
      }));

    // Open the dialog for selection of visualisation
    // Currently loading
    const dialogRef = this.cogService.openCogModal(visualisations, true);

    // Query for each of the currently viewed items what visualisations they match
    const contributor = this.resultListService.rightListContributors[this.resultListService.selectedListTabIndex];
    const contributorId = contributor.identifier;
    const filters = this.cogService.getCogFiltersFromConfig(this.resultListService.resultlistConfigPerContId.get(contributorId));
    const dataRetriever = contributor.detailedDataRetriever;

    const itemsVisualized = (new Array(...this.actionManager.activeActionsPerContId.get(contributorId).entries()))
      .filter(v => v[1].has('visualize'));
    const visualizedItemsMatches = zip(itemsVisualized.map(v => dataRetriever.getMatch(v[0], filters)));

    visualizedItemsMatches.subscribe(m => {
      const nbMatches = this.computeMatchesPerVisualisation(m, visualisations);

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
    });

    dialogRef.afterClosed().pipe(first()).subscribe((v: VisualisationInterface) => {
      const idx = this.cogService.currentCogVisualisationConfig.findIndex(vis => v === vis);
      this.cogService.setSelectedCogVisualisation(v, idx, visualisations[idx]?.preview);
    });
  }

  /**
   * For each visualisation, compute how many of the currently visualised items are matching it.
   * If the item is matching and no preview is defined by default, sets it.
   * @param matches List of matches and data per item
   * @param visualisations List of visualisations
   * @returns The amount of items matching a visualisation
   */
  private computeMatchesPerVisualisation(matches: Array<MatchInfo>, visualisations: Array<CogVisualisationData>) {
    const nbMatches = visualisations.map(_ => 0);
    let currentIdx = 0;
    visualisations.forEach((v, visIdx) => {
      // For each visualisation, check if each item matches at least one dataGroup
      matches.forEach(mi => {
        let isMatched = false;
        v.visualisation.dataGroups.forEach((dg, dgIdx) => {
          isMatched = isMatched || mi.matched[currentIdx + dgIdx];
          this.cogService.setDefaultPreview(mi.matched[currentIdx + dgIdx], mi.data, dg, v, visIdx);
        });

        if (isMatched) {
          nbMatches[visIdx] += 1;
        }
      });
      currentIdx += v.visualisation.dataGroups.length;
    });

    return nbMatches;
  }
}
