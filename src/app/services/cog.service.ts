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
import { MatDialog } from '@angular/material/dialog';
import { getTitilerPreviewUrl, VisualisationPreview } from 'app/tools/cog';
import { getItem } from 'app/tools/utils';
import { CollectionReferenceParameters, Expression, Filter, Search } from 'arlas-api';
import { CogModalComponent, CogVisualisationData, ResultlistNotifierService, VisualisationInterface } from 'arlas-web-components';
import { Action, ElementIdentifier, ResultListContributor } from 'arlas-web-contributors';
import { ActionFilter } from 'arlas-web-contributors/models/models';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { first, map, Observable, Subject, take } from 'rxjs';
import { ActionManagerService } from './action-manager.service';
import { VisualizeService } from './visualize.service';

/**
 * This service is the interface between the ResultlistService and the VisualizeService for the viusalisation of COGs.
 * It stores the state of the visualisation as well as offers utilitary methods to facilitate those visualisations.
 */
@Injectable({
  providedIn: 'root'
})
export class CogService<L, S, M> {
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();

  /** --- Configuration of the current resultlist */
  /** Input field of the contributor configuration */
  public contributorConfig: any;
  /** Contributor Id */
  public contributorId: string;
  /** Current configuration for the visualisation of COGs */
  public currentCogVisualisationConfig: VisualisationInterface[];

  /** --- Visualisation state */
  /** Current COG visualisation */
  private selectedCogVisualisation = new Map<string, VisualisationPreview>();
  /** Emits any change to the visualisation used for the COGs */
  public cogVisualisationChange = new Subject<VisualisationPreview>();
  /** Whether this is the first selection of a COG */
  protected firstCogSelection  = true;
  /** Previews for each of the visualisations defined. Allows to query only once for default preview */
  private defaultPreviews = new Array<string>();

  public constructor(
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly dialog: MatDialog,
    private readonly visualizeService: VisualizeService<L, S, M>,
    private readonly listNotifier: ResultlistNotifierService,
    private readonly actionManager: ActionManagerService
  ) { }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public setCogVisualisationConfig(contributorId: string, contributorConfig: any) {
    this.contributorId = contributorId;
    this.contributorConfig = contributorConfig;

    if (contributorConfig.visualisationsList) {
      this.currentCogVisualisationConfig = contributorConfig.visualisationsList;
      this.defaultPreviews = this.currentCogVisualisationConfig.map(v => undefined);
    }
  }

  public updateCogVisualisation(contributorId: string, contributorConfig: any) {
    this.setCogVisualisationConfig(contributorId, contributorConfig);
    this.firstCogSelection = !this.selectedCogVisualisation.has(this.contributorId);

    this.cogVisualisationChange.next(this.getCurrentVisualisation());
  }

  /**
   *  Open cog visualisation dialog to select the first cog visualisation
   */
  public openCogSelectionDialog(data: { action: Action; elementidentifier: ElementIdentifier; }): Observable<VisualisationPreview> {
    const visualisations: Array<CogVisualisationData> = this.currentCogVisualisationConfig.map((v, idx) => (
      { visualisation: v, match: 'none', preview: this.getDefaultPreview(idx)}));

    // TODO: decide if we want for the popup to load while the previews are loading,
    // or shall it have this degraded state with no previews but the functionalities

    // Parses the array to find out which visualisations are enabled
    let i = 0;
    this.currentCogVisualisationConfig.forEach((v, vidx) => {
      v.dataGroups.forEach(_ => {
        if (data.action.matched[i]) {
          visualisations[vidx].match = 'all';
        }
        i++;
      });
    });

    const searchResult = getItem(data.elementidentifier,
      this.collaborativeService.registry.get(this.contributorId).collection, this.collaborativeService);

    // Fetch the detail of the item to replace the fields in the url
    searchResult.subscribe(h => {
      const itemData = h.hits[0].data;
      console.log(itemData);

      // Parses the array to get the visualisation previews
      let i = 0;
      this.currentCogVisualisationConfig.forEach((v, vidx) => {
        v.dataGroups.forEach(dg => {
          if (data.action.matched[i]) {
            // For titiler protocol, take the first datagroup that matches to create a preview url
            if (dg.protocol === 'titiler' && !visualisations[vidx].preview) {
              const previewUrl = getTitilerPreviewUrl(dg.visualisationUrl, itemData);
              visualisations[vidx].preview = previewUrl;
              this.setDefaultPreview(vidx, previewUrl);
            }
          }
          i++;
        });
      });
    });

    visualisations.filter((v, idx) => v.match === 'none' && this.getDefaultPreview(idx) === undefined).forEach(v => {
      this.findPreviewForVisualisation(v, 0);
    });

    const dialogRef = this.dialog.open(CogModalComponent, {
      data: {
        visualisations: visualisations,
        loading: false
      },
      width: '44vw',
      maxHeight:'40vh'
    });

    return dialogRef.afterClosed().pipe(first(),
      map((v: VisualisationInterface) => {
        const idx = this.currentCogVisualisationConfig.findIndex(vis => v === vis);
        return {visualisation: v, preview: visualisations[idx]?.preview, idx};
      })
    );
  }

  public setDefaultPreview(visIdx: number, previewUrl: string) {
    this.defaultPreviews[visIdx] = previewUrl;
  }

  public getDefaultPreview(visIdx: number) {
    return this.defaultPreviews[visIdx];
  }

  /**
   * Based on the visualisation given, try to recursively find the first data group with a titiler protocol for which at least one item exists.
   * Its visualisation url is used to build the preview url that is then used for the desired goal, as well as stored for future uses.
   * @param v A COG visualisation
   * @param dgIdx The current data group index
   */
  public findPreviewForVisualisation(v: CogVisualisationData, dgIdx: number) {
    console.log('fetching preview');
    // If the protocol is not titiler, skip the query
    if (v.visualisation.dataGroups[dgIdx].protocol !== 'titiler') {
      if (dgIdx + 1 < v.visualisation.dataGroups.length) {
        this.findPreviewForVisualisation(v, dgIdx + 1);
      }
      return;
    }

    const search: Search = { page: { size: 1 } };
    const filterExpression: Filter = {
      f: [[]]
    };
    const contributor = this.collaborativeService.registry.get(this.contributorId) as ResultListContributor;

    v.visualisation.dataGroups[dgIdx].filters.forEach(f => {
      filterExpression.f.push([{
        field: f.field,
        op: Expression.OpEnum[f.op.toString()],
        value: f.value
      }]);
    });

    this.collaborativeService.resolveHits(
      [projType.search, search], this.collaborativeService.collaborations,
      contributor.collection, contributor.identifier, filterExpression,
      /** flat */ true, contributor.cacheDuration
    ).pipe(take(1))
      .subscribe(hits => {
        if (hits.hits.length > 0) {
          const previewUrl = getTitilerPreviewUrl(v.visualisation.dataGroups[dgIdx].visualisationUrl, hits.hits[0].data);
          v.preview = previewUrl;
          this.setDefaultPreview(this.currentCogVisualisationConfig.findIndex(vis => vis === v.visualisation),  previewUrl);
        } else {
          if (dgIdx + 1 < v.visualisation.dataGroups.length) {
            this.findPreviewForVisualisation(v, dgIdx + 1);
          }
        }
      });
  }

  public setSelectedCogVisualisation(visualisation: VisualisationInterface, idx: number, preview: string) {
    const contributor = this.collaborativeService.registry.get(this.contributorId) as ResultListContributor;
    const contributorId = contributor.identifier;
    const previousVisualisation = this.selectedCogVisualisation.get(contributorId)?.visualisation;
    const filters = this.getCogFiltersFromConfig(this.contributorConfig);
    const visualizeAction = contributor.actionToTriggerOnClick.find(a => a.id === 'visualize');

    if (!visualisation) {
      this.selectedCogVisualisation.delete(contributorId);
      this.firstCogSelection = true;

      // Allow all data groups
      visualizeAction.filters = filters;
    } else {
      this.selectedCogVisualisation.set(contributorId, {visualisation, idx, preview});

      // Allow only the visualisation data groups
      visualizeAction.filters = visualisation.dataGroups.map(dg => dg.filters);
    }
    this.listNotifier.refreshActions();
    this.cogVisualisationChange.next({visualisation, idx, preview});

    if (!visualisation) {
      // If no visualisation, clean up the rasters
      this.visualizeService.removeRasters();
      this.actionManager.removeContributorAction(contributorId, 'visualize');
    } else if (previousVisualisation) {
      // If there is a visualisation and there are already visualisations, update them if they can be
      this.actionManager.activeActionsPerContId?.get(contributorId)?.forEach((actions, item) => {
        if (actions.has('visualize')) {
          const action: Action = {
            id: 'visualize', label: ''
          };
          contributor.detailedDataRetriever.getMatch(item, visualizeAction.filters).pipe(take(1)).subscribe({
            next: values => {
              action.matched = values.matched;
              this.visualizeService.removeRasters(item);

              // If we find a visualisationUrl, it means that we can continue viewing it, and we should switch to it
              if (this.getVisualisationUrl(action, contributor)) {
                this.visualizeRaster(
                  { action: action, elementidentifier: { idFieldName: contributor.fieldsConfiguration.idFieldName, idValue: item } },
                  contributor, contributor.collection, false);

                // Send a fake hover notification so that it can display its state properly
                this.listNotifier.notifyItemHover(item);
              } else {
                this.actionManager.removeAction(contributorId, item, 'visualize');
              }
            }
          });
        }
      });
    }
  }

  public getCogFiltersFromConfig(config: any): ActionFilter[][] {
    return config.visualisationsList
      .map(v => v.dataGroups.map(dg => dg.filters))
      // .filter(f => f.length > 0) => If there are no filters it means everyone can do it
      .reduce((a, b) => a.concat(b), []);
  }

  public getCurrentVisualisation() {
    return this.selectedCogVisualisation.get(this.contributorId);
  }

  public visualizeRasterAction(data: { action: Action; elementidentifier: ElementIdentifier; },
    listContributor: ResultListContributor, collection: string, fitBounds = true) {

    // Clicking the icon acts as an added action, so it needs to be put
    this.actionManager.addAction(listContributor.identifier, data.elementidentifier.idValue, data.action);

    if (this.firstCogSelection && !data.action.activated) {
      this.openCogSelectionDialog(data)
        .subscribe(cogStyle =>  {
          if (!cogStyle) {
            this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, 'visualize');
          }

          this.firstCogSelection = !cogStyle;
          const idx = this.currentCogVisualisationConfig.findIndex(vis => cogStyle.visualisation === vis);
          this.setSelectedCogVisualisation(cogStyle.visualisation, idx, cogStyle.preview);

          if (cogStyle.visualisation) {
            // Necessary to properly launch the visualisation
            data.action.activated = false;
            this.visualizeRaster(data, listContributor, collection, fitBounds);
          }
        });
    } else {
      this.visualizeRaster(data, listContributor, collection, fitBounds);
    }
  }

  public visualizeRaster(data: { action: Action; elementidentifier: ElementIdentifier; },
    listContributor: ResultListContributor, collection: string, fitBounds = true) {

    if (this.contributorConfig) {
      const urlVisualisationTemplate = this.getVisualisationUrl(data.action, listContributor);
      // If there is no visualisation url, then no visualisation can be done
      //  Can be caused by the item not matching any visualisation rule
      if (!urlVisualisationTemplate) {
        this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, data.action.id);
        return;
      }

      if (!data.action.activated) {
        this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlVisualisationTemplate).subscribe(url => {
          this.visualizeService.displayDataOnMap(url,
            data.elementidentifier, this.collectionToDescription.get(collection).geometry_path,
            this.collectionToDescription.get(collection).centroid_path, collection, fitBounds);
        });
        this.actionManager.addAction(listContributor.identifier, data.elementidentifier.idValue, data.action);
      } else {
        this.visualizeService.removeRasters(data.elementidentifier.idValue);
        this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, data.action.id);
      }
    }
  }

  private getVisualisationUrl(action: Action, listContributor: ResultListContributor) {
    if (action.matched) {
      const v = this.getCurrentVisualisation();

      // Find the start of the selected visualisation in the array of matches of the action
      // Only needed if there are more matches in the action than there are dataGroups.
      // It happens when this item is not the first one visualized
      let firstVisuElement = 0;
      if (action.matched.length > v.visualisation.dataGroups.length) {
        for (let i= 0; i < v.idx; i++) {
          firstVisuElement += this.currentCogVisualisationConfig[i].dataGroups.length;
        }
      }
      // The url is the one of the first dataGroup for which the item matched the condition
      return v.visualisation.dataGroups.find((_, i) => action.matched[firstVisuElement + i])?.visualisationUrl;
    } else {
      return this.contributorConfig.visualisationLink;
    }
  }
}
