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

import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Expression, Filter, Search } from 'arlas-api';
import {
  CogModalComponent, CogVisualisationData, DataGroup, ItemDataType,
  ResultlistNotifierService, VisualisationInterface
} from 'arlas-web-components';
import { Action, ActionFilter, ElementIdentifier, ResultListContributor } from 'arlas-web-contributors';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { first, map, Observable, Subject, take } from 'rxjs';
import { getTitilerPreviewUrl, VisualisationPreview } from '../tools/cog';
import { getItem$ } from '../tools/utils';
import { ActionManagerService } from './action-manager.service';
import { ContributorService } from './contributors.service';
import { VisualizeService } from './visualize.service';

/**
 * This service is the interface between the ResultlistService and the VisualizeService for the viusalisation of COGs.
 * It stores the state of the visualisation as well as offers utilitary methods to facilitate those visualisations.
 */
@Injectable({
  providedIn: 'root'
})
export class CogService<L, S, M> {
  /** --- Configuration of the current resultlist */
  /** Input field of the contributor configuration */
  public contributorConfig: any;
  /** Contributor Id */
  public contributorId!: string;
  /** Current configuration for the visualisation of COGs */
  public currentCogVisualisationConfig: VisualisationInterface[] = [];

  /** --- Visualisation state */
  /** Current COG visualisation */
  private readonly selectedCogVisualisation = new Map<string, VisualisationPreview>();
  private readonly cogVisualisationChangeSource = new Subject<VisualisationPreview | undefined>();
  /** Emits any change to the visualisation used for the COGs */
  public cogVisualisationChange$ = this.cogVisualisationChangeSource.asObservable();
  /** Whether this is the first selection of a COG */
  protected firstCogSelection  = true;
  /** Previews for each of the visualisations defined. Allows to query only once for default preview */
  private defaultPreviews = new Array<string | undefined>();
  /** Map containing for each visualised COG its DataGroup */
  public visualisedCogs = new Map<string, DataGroup>();

  /** --- Hovered state for legend */
  /** Map containing per layer id the list of item's id that are visualised and hovered */
  private readonly hoveredCogs = new Map<string, Array<string>>();
  /** Emits whenever hoveredCogs has a value change */
  public hoverCogChange = new EventEmitter<{lng: number; lat: number;}>();

  public constructor(
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly dialog: MatDialog,
    private readonly visualizeService: VisualizeService<L, S, M>,
    private readonly listNotifier: ResultlistNotifierService,
    private readonly actionManager: ActionManagerService,
    private readonly contributorsService: ContributorService
  ) { }

  public setCogVisualisationConfig(contributorId: string, contributorConfig: any) {
    this.contributorId = contributorId;
    this.contributorConfig = contributorConfig;

    if (contributorConfig.visualisationsList) {
      this.currentCogVisualisationConfig = contributorConfig.visualisationsList;
      this.defaultPreviews = this.currentCogVisualisationConfig.map(v => undefined);
    }
  }

  /**
   * When changing resultlist tab, update the current COG visualisation configuration
   * @param contributorId Resultlist tab's contributor id
   * @param contributorConfig Resultlist tab's configuration
   */
  public updateCogVisualisation(contributorId: string, contributorConfig: any) {
    this.setCogVisualisationConfig(contributorId, contributorConfig);
    this.firstCogSelection = !this.selectedCogVisualisation.has(this.contributorId);

    this.cogVisualisationChangeSource.next(this.getCurrentVisualisation());
  }

  /**
   * Open cog visualisation dialog to select the first cog visualisation
   * @param data Structure containing the action info and item informations for the element that triggered the COG visualisation selection
   * @returns An observable emitting the selected visualisation
   */
  public openCogSelectionDialog(data: { action: Action; elementidentifier: ElementIdentifier; }): Observable<VisualisationPreview> {
    const visualisations = this.initializeCogVisualisationData();

    const dialogRef = this.openCogModal(visualisations, false);
    this.fetchPreviews$(visualisations, data, dialogRef).subscribe();

    // Find the missing visualisations
    visualisations.filter((v, idx) => v.match === 'none' && this.getDefaultPreview(idx) === undefined).forEach(v => {
      this.findPreviewForVisualisation(v, 0);
    });

    return dialogRef.afterClosed().pipe(first(),
      map((v: VisualisationInterface) => {
        const idx = this.currentCogVisualisationConfig.indexOf(v);
        return {visualisation: v, preview: visualisations[idx]?.preview, idx};
      })
    );
  }

  private fetchPreviews$(visualisations: CogVisualisationData[],
    data: { action: Action; elementidentifier: ElementIdentifier; }, dialogRef?: any
  ) {
    // Parses the array to find out which visualisations are enabled
    let i = 0;
    this.currentCogVisualisationConfig.forEach((v, vidx) => {
      v.dataGroups.forEach(_ => {
        if (data.action.matched?.[i]) {
          visualisations[vidx].match = 'all';
        }
        i++;
      });
    });

    const searchResult$ = getItem$(data.elementidentifier,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.collaborativeService.registry.get(this.contributorId)!.collection, this.collaborativeService);

    // Fetches the detail of the item to replace the fields in the url
    return searchResult$.pipe(map(h => {
      if (!h.hits) {
        return;
      }

      const itemData = h.hits[0].data;
      // Parses the array to get the visualisation previews
      let i = 0;
      this.currentCogVisualisationConfig.forEach((v, vidx) => {
        v.dataGroups.forEach(dg => {
          this.setDefaultPreview(!!data.action.matched?.[i], itemData, dg, visualisations[vidx], vidx);
          dialogRef?.componentInstance.update(visualisations, false);
          i++;
        });
      });
    }));
  }

  public openCogModal(visualisations: Array<CogVisualisationData>, loading: boolean) {
    return this.dialog.open(CogModalComponent, {
      data: {
        visualisations,
        loading
      },
      width: '600px',
      maxHeight:'50vh',
      panelClass: 'arlas-cog-modal',
      disableClose: true
    });
  }

  /**
   * Based on the visualisation and whether the item matches a Titiler datagroup, set the preview of the visualisation
   * @param match Whether the item matches the visualisation
   * @param itemData The data of the item
   * @param dg The data group that the item is being tested for
   * @param visualisation The visualisation containing the datagroup
   * @param visIdx The index of the visualisation
   */
  public setDefaultPreview(match: boolean, itemData: Record<string, ItemDataType>,
    dg: DataGroup, visualisation: CogVisualisationData, visIdx: number) {

    // For titiler protocol, take the first datagroup that matches to create a preview url
    if (match && dg.protocol === 'titiler' && !visualisation.preview) {
      const previewUrl = getTitilerPreviewUrl(dg.visualisationUrl, itemData);
      visualisation.preview = previewUrl;
      this.defaultPreviews[visIdx] = previewUrl;
    }
  }

  public getDefaultPreview(visIdx: number) {
    return this.defaultPreviews[visIdx];
  }

  /**
   * Based on the given visualisation, try to recursively find the first data group with a titiler protocol for which at least one item exists.
   * Its visualisation url is used to build the preview url that is then used for the desired goal, as well as stored for future uses.
   * @param v A COG visualisation
   * @param dgIdx The current data group index
   */
  public findPreviewForVisualisation(v: CogVisualisationData, dgIdx: number) {
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
      filterExpression.f ??= [];
      filterExpression.f.push([{
        field: f.field,
        op: Expression.OpEnum[f.op.toString() as keyof typeof Expression.OpEnum],
        value: f.value
      }]);
    });

    this.collaborativeService.resolveHits(
      [projType.search, search], this.collaborativeService.collaborations,
      contributor.collection, contributor.identifier, filterExpression,
      /** flat */ true, contributor.getCacheDuration()
    ).pipe(take(1))
      .subscribe(hits => {
        if (hits.hits && hits.hits.length > 0) {
          const previewUrl = getTitilerPreviewUrl(v.visualisation.dataGroups[dgIdx].visualisationUrl, hits.hits[0].data);
          v.preview = previewUrl;
          this.defaultPreviews[this.currentCogVisualisationConfig.indexOf(v.visualisation)] = previewUrl;
        } else if (dgIdx + 1 < v.visualisation.dataGroups.length) {
          this.findPreviewForVisualisation(v, dgIdx + 1);
        }
      });
  }

  /**
   * Resets the currently selected COG visualisation
   */
  public resetCogVisualisation() {
    if (this.currentCogVisualisationConfig) {
      this.setSelectedCogVisualisation(undefined, 0, '');
    }
  }

  /**
   * Sets the COG visualisation based on selection. If there were items that were visualized,
   * removes them and if they match the new viusalisation, visualizes them again
   * @param visualisation Configuration to visualize COGs
   * @param idx Id of the selected visualisation
   * @param preview Preview for the visualisation. Can be undefined if it has not yet been computed
   * @param itemId Id of the item that triggered the change of viusalisation. Only present when first selecting a visualisation
   */
  public setSelectedCogVisualisation(
    visualisation: VisualisationInterface | undefined, idx: number, preview: string | undefined, itemId?: string
  ) {
    const contributor = this.collaborativeService.registry.get(this.contributorId) as ResultListContributor;
    const contributorId = contributor.identifier;
    const previousVisualisation = this.selectedCogVisualisation.get(contributorId)?.visualisation;
    const visualizeAction = contributor.actionToTriggerOnClick.find(a => a.id === 'visualize') as Action;

    if (!visualisation) {
      this.selectedCogVisualisation.delete(contributorId);
      this.firstCogSelection = true;

      // Allow all data groups
      const filters = this.getCogFiltersFromConfig(this.contributorConfig);
      visualizeAction.filters = filters;
    } else {
      this.selectedCogVisualisation.set(contributorId, {visualisation, idx, preview});

      // Allow only the visualisation data groups
      visualizeAction.filters = visualisation.dataGroups.map(dg => dg.filters);
    }
    this.listNotifier.refreshActions(itemId);
    this.cogVisualisationChangeSource.next(visualisation ? {visualisation, idx, preview} : undefined);

    if (!visualisation) {
      // If no visualisation, clean up the rasters
      this.visualizeService.removeRasters();
      this.visualisedCogs.clear();
      this.actionManager.removeContributorAction(contributorId, 'visualize');
    } else if (previousVisualisation) {
      // If there is a visualisation and there are already visualisations, update them if they can be
      this.actionManager.activeActionsPerContId?.get(contributorId)?.forEach((actions, item) => {
        if (actions.has('visualize')) {
          const action: Action = {
            id: 'visualize', label: ''
          };
          contributor.detailedDataRetriever.getMatch(item, visualizeAction.filters ?? []).pipe(take(1)).subscribe({
            next: values => {
              action.matched = values.matched;
              this.visualizeService.removeRasters(item);
              this.visualisedCogs.delete(item);

              // If we find a visualisationUrl, it means that we can continue viewing it, and we should switch to it
              if (this.getVisualisationUrl(action)) {
                this.visualizeRaster(
                  { action: action, elementidentifier: { idFieldName: contributor.fieldsConfiguration.idFieldName, idValue: item } },
                  contributor, false);

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
    return (config.visualisationsList as VisualisationInterface[])
      .flatMap(v => v.dataGroups.map(dg => dg.filters));
  }

  public getCurrentVisualisation() {
    return this.selectedCogVisualisation.get(this.contributorId);
  }

  /**
   * Visualizes an item on the map from a list action.
   * If no COG visualisation is chosen among the configured ones, then first open the COG selection screen.
   * Otherwise, visualizes the raster.
   * @param data Structure containing the action info and item informations for the element that triggered the COG visualisation selection
   * @param listContributor Resultlist tab's contributor
   * @param fitBounds Whether to zoom in on the footprint of the item
   */
  public visualizeRasterAction(data: { action: Action; elementidentifier: ElementIdentifier; },
    listContributor: ResultListContributor, fitBounds = true) {

    // Clicking the icon acts as an added action, so it needs to be put
    this.actionManager.addAction(listContributor.identifier, data.elementidentifier.idValue, data.action);

    if (this.currentCogVisualisationConfig && this.firstCogSelection && !data.action.activated) {
      const defaultConfigurationIdx = this.currentCogVisualisationConfig
        .findIndex((visu, idx) => !!visu.default && data.action.matched?.[idx]);

      // If there is a default visualisation that the item matches, launch the visualisation directly
      if (defaultConfigurationIdx >= 0) {
        this.firstCogSelection = false;
        const visualisations = this.initializeCogVisualisationData();

        const conf = this.currentCogVisualisationConfig[defaultConfigurationIdx];
        // Set the preview as undefined first
        this.setSelectedCogVisualisation(conf, defaultConfigurationIdx, undefined, data.elementidentifier.idValue);
        // Then compute async the preview for the selected default visualisation
        this.fetchPreviews$(visualisations, data).subscribe(() => {
          this.setSelectedCogVisualisation(conf, defaultConfigurationIdx,
            this.getDefaultPreview(defaultConfigurationIdx), data.elementidentifier.idValue);
        });

        // Necessary to properly launch the visualisation
        data.action.activated = false;
        this.visualizeRaster(data, listContributor, fitBounds);
      } else {
        // No default visualisation, so open the selection dialog
        this.openCogSelectionDialog(data)
          .subscribe(cogStyle =>  {
            if (!cogStyle) {
              this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, 'visualize');
            }

            this.firstCogSelection = !cogStyle;
            const idx = this.currentCogVisualisationConfig.indexOf(cogStyle.visualisation);
            this.setSelectedCogVisualisation(cogStyle.visualisation, idx, cogStyle.preview, data.elementidentifier.idValue);

            if (cogStyle.visualisation) {
              // Necessary to properly launch the visualisation
              data.action.activated = false;
              this.visualizeRaster(data, listContributor, fitBounds);
            }
          });
      }
    } else {
      this.visualizeRaster(data, listContributor, fitBounds);
    }
  }

  /**
   * Creates a list of COG visualisations with no matches and default previews.
   * This list is then filled when the info becomes available
   */
  private initializeCogVisualisationData(): CogVisualisationData[] {
    return this.currentCogVisualisationConfig.map((v, idx) => (
      { visualisation: v, match: 'none', preview: this.getDefaultPreview(idx)}));
  }

  /**
   * Visualize an item on the map through the VisualizeService
   * @param data Structure containing the action info and item informations for the element that triggered the COG visualisation selection
   * @param listContributor Resultlist tab's contributor
   * @param fitBounds Whether to zoom in on the footprint of the item
   */
  public visualizeRaster(data: { action: Action; elementidentifier: ElementIdentifier; },
    listContributor: ResultListContributor, fitBounds = true) {

    if (this.contributorConfig) {
      if (!data.action.activated) {
        const urlVisualisationTemplate = this.getVisualisationUrl(data.action);
        // If there is no visualisation url, then no visualisation can be done
        // Can be caused by the item not matching any visualisation rule
        if (!urlVisualisationTemplate) {
          this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, data.action.id);
          return;
        }

        const collectionDescription = this.contributorsService.collectionToDescription.get(listContributor.collection);
        if (!collectionDescription) {
          return;
        }

        this.visualizeService.getVisuInfo(data.elementidentifier, listContributor.collection, urlVisualisationTemplate)
          .subscribe(url => {
            this.visualizeService.displayDataOnMap(url, data.elementidentifier, collectionDescription.geometry_path,
              collectionDescription.centroid_path, listContributor.collection, fitBounds);

            // Edit visualisationUrl to be the one used by the product
            const dataGroup = this.getDataGroup(data.action);
            if (dataGroup) {
              const updatedDataGroup: DataGroup = { ...dataGroup, visualisationUrl: url };
              this.visualisedCogs.set(data.elementidentifier.idValue, updatedDataGroup);
            }
          });
        this.actionManager.addAction(listContributor.identifier, data.elementidentifier.idValue, data.action);
      } else {
        this.visualizeService.removeRasters(data.elementidentifier.idValue);
        this.actionManager.removeAction(listContributor.identifier, data.elementidentifier.idValue, data.action.id);

        // If the last raster on the map is removed, then reset selected visualisation
        if (!this.visualizeService.isRasterOnMap()) {
          this.resetCogVisualisation();
        }
      }
    }
  }

  public hoverCogs(layerId: string, ids: Array<string>, coordinates: {lng: number; lat: number;}) {
    this.hoveredCogs.set(layerId, ids);
    this.hoverCogChange.next(coordinates);
  }

  public getHoveredCogs() {
    const uniqueIds = new Set<string>();
    Array.from(this.hoveredCogs.values()).forEach(ids => {
      ids.forEach(id => uniqueIds.add(id));
    });
    return uniqueIds;
  }

  private getVisualisationUrl(action: Action) {
    if (action.matched) {
      // The url is the one of the first dataGroup for which the item matched the condition
      return this.getDataGroup(action)?.visualisationUrl;
    } else {
      return this.contributorConfig.visualisationLink;
    }
  }

  /**
   * @param action Action for the item containing the matches for the visualisations
   * @returns The first matching data group in the current visualisation
   */
  private getDataGroup(action: Action) {
    const v = this.getCurrentVisualisation();
    if (!v?.visualisation?.dataGroups) {
      return undefined;
    }

    // Find the start of the selected visualisation in the array of matches of the action
    // Only needed if there are more matches in the action than there are dataGroups.
    // It happens when this item is not the first one visualized
    let firstVisuElement = 0;
    if (action.matched && action.matched.length > v.visualisation.dataGroups.length) {
      for (let i= 0; i < v.idx; i++) {
        firstVisuElement += this.currentCogVisualisationConfig[i].dataGroups.length;
      }
    }
    // The url is the one of the first dataGroup for which the item matched the condition
    return v.visualisation.dataGroups.find((_, i) => action.matched?.[firstVisuElement + i]);
  }
}
