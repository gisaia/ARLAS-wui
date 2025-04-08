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

import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { ArlasWuiMapService } from '../services/map.service';
import { VisualizeService } from '../services/visualize.service';
import { isElementInViewport } from 'app/tools/utils';
import { CollectionReferenceParameters, Expression } from 'arlas-api';
import {
  CellBackgroundStyleEnum, Column, ElementIdentifier, Item, ModeEnum, PageQuery, ResultListComponent, SortEnum
} from 'arlas-web-components';
import { Action, ExtentFilterGeometry, MapContributor, ResultListContributor } from 'arlas-web-contributors';
import {
  AiasDownloadComponent, AiasEnrichComponent, ArlasCollaborativesearchService, ArlasConfigService,
  ArlasExportCsvService, ArlasSettingsService, DOWNLOAD_PROCESS_NAME, ENRICH_PROCESS_NAME, getParamValue, ProcessService
} from 'arlas-wui-toolkit';
import { BehaviorSubject, finalize, Subject, take } from 'rxjs';
import { CogService } from './cog.service';


@Injectable({
  providedIn: 'root'
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ResultlistService<L, S, M> {
  /** Resultlist configs */
  public resultlistConfigs = [];
  public resultlistConfigPerContId = new Map<string, any>();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();

  /** Resultlist contributors */
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public rightListContributors: Array<ResultListContributor> = new Array();
  public previewListContrib: ResultListContributor = null;

  /** Resultlist state */
  public isGeoSortActivated = new Map<string, boolean>();
  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();
  public selectedListTabIndex = 0;
  public listOpen = false;
  public listOpenChange = new Subject<boolean>();
  private currentClickedFeatureId: string = undefined;
  public resultlistIsExporting = false;
  public selectedItems = new Array<ElementIdentifier>();

  /** Resullist component */
  private listComponent: ResultListComponent;

  /**
   * Event emitted when an action is performed on the list
   */
  public actionOnList = new Subject<{ origin: string; event: string; data?: any; }>();

  public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly mapService: ArlasWuiMapService<L, S, M>,
    private readonly collaborativeService: ArlasCollaborativesearchService,
    private readonly settingsService: ArlasSettingsService,
    private readonly configService: ArlasConfigService,
    private readonly processService: ProcessService,
    private readonly exportService: ArlasExportCsvService,
    private readonly snackbar: MatSnackBar,
    private readonly visualizeService: VisualizeService<L, S, M>,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog,
    private readonly cogService: CogService<L, S, M>
  ) { }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultlistConfigs: any[]) {
    this.resultlistContributors = resultlistContributors;

    if (this.resultlistContributors.length > 0) {
      this.resultlistConfigs = resultlistConfigs;

      this.resultlistConfigs.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultlistConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });

      this.rightListContributors = this.resultlistContributors
        .filter(c => this.resultlistConfigs.some((rc) => c.identifier === rc.contributorId))
        .map(rlcontrib => {
          (rlcontrib as any).name = rlcontrib.getName();
          const sortColumn = rlcontrib.fieldsList.find(c => !!(c as any).sort && (c as any).sort !== '');
          if (sortColumn) {
            this.sortOutput.set(rlcontrib.identifier, {
              columnName: sortColumn.columnName,
              fieldName: sortColumn.fieldName,
              sortDirection: (sortColumn as any).sort === 'asc' ? SortEnum.asc : SortEnum.desc
            });
          }
          return rlcontrib;
        });

      const selectedResultlistTab = getParamValue('rt');
      const listIdx = this.rightListContributors.findIndex(r => r.getName() === decodeURI(selectedResultlistTab));
      if (listIdx >= 0) {
        this.selectList(listIdx);
      } else {
        this.selectList(0);
      }

      this.declareResultlistExportCsv();
    }
  }

  /**
   * Method to set actions and interactions of the list with the map
   */
  public setMapListInteractions() {
    this.addActions();
    this.declareGlobalRasterVisualisation();
  }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public toggleList() {
    this.listOpen = !this.listOpen;
    this.listOpenChange.next(this.listOpen);
    const queryParams = { ...this.activatedRoute.snapshot.queryParams };
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public selectList(index: number) {
    this.selectedListTabIndex = index;
    this.previewListContrib = this.resultlistContributors[index];
  }

  public isThumbnailProtected(): boolean {
    return this.resultlistContributors[this.selectedListTabIndex].fieldsConfiguration?.useHttpThumbnails ?? false;
  }

  public updateMapStyleFromScroll(items: Array<Item>, collection: string) {
    this.mapService.updateMapStyle(items.map(i => i.identifier), collection);
  }

  public applyMapExtent(pwithinRaw: string, pwithin: string) {
    this.resultlistContributors
      .forEach(c => {
        const mapContrib = this.mapService.getContributorByCollection(c.collection);
        this.setResultlistGeoFilter(c, mapContrib, pwithinRaw, pwithin);
        this.collaborativeService.registry.set(c.identifier, c);
      });
    this.resultlistContributors.forEach(c => {
      if (this.isGeoSortActivated.get(c.identifier)) {
        c.geoSort(this.mapService.centerLatLng.lat, this.mapService.centerLatLng.lng, true);
      } else {
        c.sortColumn(this.sortOutput.get(c.identifier), true);
      }
    });
  }

  /**
   * Sets the geographical filter to apply on the resultlist when moving the map.
   * @param resultlistContributor resultlist contributor whose filter will be updated.
   * @param mapContributor map contributor used to get the filter.
   * @param rawExtent The extent of the map. The data will be fetched using this extent.
   * @param wrappedExtent Wrapped format of the rawExtent (wrapped to the range [-180, 180]).
   */
  private setResultlistGeoFilter(resultlistContributor: ResultListContributor, mapContributor: MapContributor | undefined,
    rawExtent: string, wrappedExtent: string): void {
    if (!!mapContributor) {
      let geoField: string | undefined;
      let geoOp: Expression.OpEnum;
      if (mapContributor.windowExtentGeometry === ExtentFilterGeometry.geometry_path) {
        geoField = this.collectionToDescription.get(resultlistContributor.collection)?.geometry_path;
        geoOp = Expression.OpEnum.Intersects;
      } else {
        geoField = this.collectionToDescription.get(resultlistContributor.collection)?.centroid_path;
        geoOp = Expression.OpEnum.Within;
      }
      if (geoField) {
        resultlistContributor.filter = mapContributor.getExtentFilter(rawExtent, wrappedExtent, geoField, geoOp, true);
      }
    }
  }

  public highlightItems(hoveredFeatures: any[]) {
    this.resultlistContributors.forEach(c => {
      const idFieldName = this.collectionToDescription.get(c.collection).id_path;
      const highLightItems = hoveredFeatures
        .filter(f => f.layer.metadata.collection === c.collection)
        .map(f => f.properties[idFieldName.replace(/\./g, '_')])
        .filter(id => id !== undefined)
        .map(id => id.toString());
      c.setHighlightItems(highLightItems);
    });
  }

  public clearHighlightedItems() {
    this.resultlistContributors.forEach(c => {
      c.setHighlightItems([]);
    });
  }

  /**
   * Update which elements from the list are visible on the map
   */
  public updateVisibleItems() {
    if (this.previewListContrib && !!this.collectionToDescription.get(this.previewListContrib.collection)) {
      const idFieldName = this.collectionToDescription.get(this.previewListContrib.collection).id_path;
      const visibleItems = this.previewListContrib.data.map(i => (i.get(idFieldName) as number | string))
        .filter(i => i !== undefined && isElementInViewport(document.getElementById(i.toString())));
      this.mapService.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }
  }

  /**
   * Updates features style on map after repopulating the resultlist with data
   * @param items List of items constituting the resultlist
   */
  public updateMapStyleFromChange(items: Array<Map<string, string>>, collection: string) {
    if (this.collectionToDescription.size > 0) {
      const idFieldName = this.collectionToDescription.get(collection).id_path;
      setTimeout(() => {
        const visibleItems = items.map(item => item.get(idFieldName))
          .filter(id => id !== undefined && isElementInViewport(document.getElementById(id.toString())));
        this.mapService.updateMapStyle(visibleItems, collection);
      }, 200);
    }
  }

  public openDetail(id: string): BehaviorSubject<boolean> {
    const isOpen = new BehaviorSubject<boolean>(false);
    const listConfig = this.resultlistConfigPerContId.get(this.previewListContrib.identifier);
    const isListMode = listConfig.defautMode === ModeEnum.list;

    if (isListMode) {
      const detailListButton = document.getElementById('open-detail-' + id);
      if (detailListButton) {
        // close previous if exists
        if (this.currentClickedFeatureId) {
          const closeButtonElement = document.getElementById('close-detail-' + this.currentClickedFeatureId);
          if (closeButtonElement) {
            closeButtonElement.click();
          }
        }
        detailListButton.click();
        this.currentClickedFeatureId = id;
        isOpen.next(true);
      }
    } else {
      const productTile = document.getElementById('grid-tile-' + id);
      const isDetailledGridOpen = listConfig.isDetailledGridOpen;
      if (productTile) {
        productTile.click();
        if (!isDetailledGridOpen) {
          setTimeout(() => {
            const detailGridButton = document.getElementById('show_details_gridmode_btn');
            if (detailGridButton) {
              detailGridButton.click();
              isOpen.next(true);
            }
          }, 250);
        } else {
          // If image is displayed switch to detail data
          const gridDivs = document.getElementsByClassName('resultgrid__img');
          if (gridDivs.length > 0) {
            const imgDiv = gridDivs[0].parentElement;
            if (window.getComputedStyle(imgDiv).display === 'block') {
              setTimeout(() => {
                const detailGridButton = document.getElementById('show_details_gridmode_btn');
                if (detailGridButton) {
                  detailGridButton.click();
                  isOpen.next(true);
                }
              }, 1);
            }
          }
        }
      }

      return isOpen;
    }
  }

  public toggleGeosort(isGeosort: boolean, resultListContributor: ResultListContributor): void {
    this.isGeoSortActivated.set(resultListContributor.identifier, isGeosort);
    const mapContributor = this.mapService.getContributorByCollection(resultListContributor.collection);
    if (isGeosort) {
      /** Apply geosort in list */
      const lat = this.mapService.centerLatLng.lat;
      const lng = this.mapService.centerLatLng.lng;
      resultListContributor.geoSort(lat, lng, true);
      this.sortOutput.delete(resultListContributor.identifier);

      /** Apply geosort in map (for simple mode) */
      mapContributor.searchSort = resultListContributor.geoOrderSort;
      mapContributor.searchSize = resultListContributor.pageSize;
    } else {
      const idFieldName = resultListContributor.getConfigValue('fieldsConfiguration')['idFieldName'];
      this.sortOutput.set(resultListContributor.identifier,
        { fieldName: idFieldName, sortDirection: SortEnum.none });
      /** Sort the list by the selected column and the id field name */
      resultListContributor.sortColumn({ fieldName: idFieldName, sortDirection: SortEnum.none }, true);
      mapContributor.searchSort = resultListContributor.sort;
      mapContributor.searchSize = resultListContributor.pageSize;
    }
    this.mapService.clearWindowData(mapContributor);
    mapContributor.drawGeoSearch(0, true);
  }

  public getBoardEvents(event: { origin: string; event: string; data?: any; }) {
    const resultListContributor = this.collaborativeService.registry.get(event.origin) as ResultListContributor;
    const currentCollection = resultListContributor.collection;
    const mapContributor = this.mapService.getContributorByCollection(currentCollection);
    switch (event.event) {
      case 'paginationEvent':
        this.paginate(resultListContributor, event.data);
        break;
      case 'sortColumnEvent':
        this.sortColumnEvent(event.origin, event.data);
        break;
      case 'consultedItemEvent':
        if (mapContributor) {
          const f = mapContributor.getFeatureToHightLight(event.data);
          if (f) {
            f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
          }
          this.mapService.featureToHightLight = f;
        }
        break;
      case 'selectedItemsEvent': {
        const ids: Array<string> = event.data;
        const idPath = this.collectionToDescription.get(currentCollection)?.id_path;
        if (idPath) {
          this.mapService.selectFeatures(idPath, ids, mapContributor);
          this.selectedItems = ids.map(id => ({ idFieldName: idPath, idValue: id }));
        }
        break;
      }
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        if (event.data.id === 'production') {
          this.aiasDownload(this.selectedItems.map(i => i.idValue), currentCollection);
        } else if (event.data.id === 'enrich') {
          this.aiasEnrich(this.selectedItems.map(i => i.idValue), currentCollection);
        } else if (event.data.id === 'export_csv') {
          this.resultlistIsExporting = true;
          this.exportService.fetchResultlistData$(resultListContributor, undefined)
            .pipe(finalize(() => this.resultlistIsExporting = false))
            .subscribe({
              next: (h) => this.exportService.exportResultlist(resultListContributor, h),
              error: (e) => this.snackbar.open(marker('An error occured exporting the list'))
            });
        } else if (event.data.id === 'visualize') {
          console.log('in');
          this.selectedItems.forEach(e => {
            // For each element, check if the necessary fields for the visualisation are present
            this.listComponent.detailedDataRetriever.getValues(e.idValue, event.data.fields).pipe(take(1)).subscribe({
              next: (values: string[]) => {
                // If no field is missing, visualize the raster
                if (values.filter(v => !v).length === 0) {
                  this.cogService.visualizeRaster({ action: event.data, elementidentifier: e }, resultListContributor, currentCollection, false);
                  // this.addAction(event.origin, e.idValue, event.data.action);
                }
              }
            });
          });
        }
        break;
      case 'geoSortEvent':
      case 'geoAutoSortEvent':
        this.toggleGeosort(event.data, resultListContributor);
        break;
    }
    this.actionOnList.next(event);
  }

  /**
   * Called at the end of scrolling the list
   * @param contributor ResultlistContributor instance that fetches the data
   * @param eventPaginate Which page is queried
   */
  private paginate(contributor: ResultListContributor, eventPaginate: PageQuery): void {
    contributor.getPage(eventPaginate.reference, eventPaginate.whichPage);
    const sort = this.isGeoSortActivated.get(contributor.identifier) ? contributor.geoOrderSort : contributor.sort;
    this.mapService.mapContributors
      .filter(c => c.collection === contributor.collection)
      .forEach(c => c.getPage(eventPaginate.reference, sort, eventPaginate.whichPage, contributor.maxPages));
  }

  public actionOnItemEvent(data: { action: Action; elementidentifier: ElementIdentifier; },
    mapContributor: MapContributor, listContributor: ResultListContributor, collection: string) {

    switch (data.action.id) {
      case 'zoomToFeature':
        if (mapContributor) {
          mapContributor.getBoundsToFit(data.elementidentifier, collection)
            .subscribe(bounds => this.visualizeService.fitbounds = bounds);
        }
        break;
      case 'visualize':
        this.cogService.visualizeRasterAction(data, listContributor, collection, false);
        break;
      case 'download':
        if (this.resultlistConfigPerContId.get(listContributor.identifier)) {
          const urlDownloadTemplate = this.resultlistConfigPerContId.get(listContributor.identifier).downloadLink;
          if (urlDownloadTemplate) {
            this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlDownloadTemplate).subscribe(url => {
              const win = window.open(url, '_blank');
              win.focus();
            });
          }
        }
        break;
      case 'production':
        this.aiasDownload([data.elementidentifier.idValue], collection);
        break;
      case 'enrich':
        this.aiasEnrich([data.elementidentifier.idValue], collection);
        break;
    }
  }

  public setListComponent(listComponent: ResultListComponent) {
    this.listComponent = listComponent;
  }

  public getListComponent() {
    return this.listComponent;
  }

  public unsetListComponent() {
    this.listComponent = null;
  }

  public waitForList(callback: () => any) {
    const interval = setInterval(() => {
      if (this.listComponent !== undefined) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }

  private process<T>(processName: string, ids: string[], collection: string, component: ComponentType<T>, additionalData?: any) {
    const maxItems = this.settingsService.getProcessSettings(processName).max_items;
    if (ids.length <= maxItems) {
      this.processService.load(processName).subscribe({
        next: () => {
          this.processService.getItemsDetail(
            this.collectionToDescription.get(collection).id_path,
            ids,
            collection
          ).subscribe({
            next: (item: any) => {
              const data = { ids, collection, nbProducts: ids.length, itemDetail: item, ...additionalData };

              this.dialog
                .open(component, {
                  minWidth: '520px',
                  maxWidth: '60vw',
                  data: data,
                  panelClass: 'arlas-aias-dialog'
                });
            }
          });
        }
      });
    } else {
      this.snackbar.open(
        this.translate.instant('You have exceeded the number of products authorised for a single process',
          { max: maxItems, name: this.translate.instant(processName) }), 'X',
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 5000
        }
      );
    }
  }

  private aiasDownload(ids: string[], collection: string) {
    this.process(DOWNLOAD_PROCESS_NAME, ids, collection, AiasDownloadComponent,
      { wktAoi: this.mapService.mapComponent.getAllPolygon('wkt') });
  }

  private aiasEnrich(ids: string[], collection: string) {
    this.process(ENRICH_PROCESS_NAME, ids, collection, AiasEnrichComponent);
  }

  /** This method sorts the list on the given column. The features are also sorted if the `Simple mode` is activated in mapContributor  */
  private sortColumnEvent(contributorId: string, sortOutput: Column) {
    const resultlistContributor = (this.collaborativeService.registry.get(contributorId) as ResultListContributor);
    this.isGeoSortActivated.set(contributorId, false);
    /** Save the sorted column */
    this.sortOutput.set(contributorId, sortOutput);
    /** Sort the list by the selected column and the id field name */
    resultlistContributor.sortColumn(sortOutput, true);

    this.mapService.mapContributors
      .filter(c => c.collection === resultlistContributor.collection)
      .forEach(c => {
        // Could have some problems if we put 2 lists with the same collection and different sort ?
        c.searchSort = resultlistContributor.sort;
        c.searchSize = resultlistContributor.getConfigValue('search_size');
        /** Redraw features with setted sort in case of window mode */
        /** Remove old features */
        this.mapService.clearWindowData(c);
        /** Set new features */
        c.drawGeoSearch(0, true);
      });
  }

  private addActions() {
    this.resultlistContributors.forEach(c => {
      const listActionsId = c.actionToTriggerOnClick.map(a => a.id);
      const mapcontributor = this.mapService.mapContributors.find(mc => mc.collection === c.collection);
      const config = this.resultlistConfigPerContId.get(c.identifier);
      if (config) {
        if (!listActionsId.includes('visualize')) {
          const action: Action = {
            id: 'visualize', label: marker('Visualize'), icon: 'visibility', cssClass: '', tooltip: marker('Visualize on the map'),
            reverseAction: {
              id: 'remove', label: marker('Remove from map'), cssClass: '', tooltip: marker('Remove from map'), icon: 'visibility_off'
            }
          };
          (action as any).hide = true;
          if (config.visualisationLink) {
            action.fields = this.visualizeService.getVisuFields(config.visualisationLink);
            c.addAction(action);
          } else if (config.visualisationsList) {
            action.filters = this.cogService.getCogFiltersFromConfig(config);
            c.addAction(action);
          }
        }
        if (!!this.resultlistConfigPerContId.get(c.identifier).downloadLink && !listActionsId.includes('download')) {
          c.addAction({
            id: 'download', label: marker('Download metadata'),
            cssClass: '', tooltip: marker('Download description of the item')
          });
        }
      }
      if (!!mapcontributor && !listActionsId.includes('zoomToFeature')) {
        c.addAction({ id: 'zoomToFeature', label: marker('Zoom to'), cssClass: '', tooltip: marker('Zoom to item') });
      }
    });

    // Check if the user can access process endpoint
    this.addProcess(DOWNLOAD_PROCESS_NAME, 'production', marker('Download product'), '',
      marker('Download product archive'), 'download');

    this.addProcess(ENRICH_PROCESS_NAME, 'enrich', marker('Enrich product'), '',
      marker('Enrich product with more assets'), 'add_photo_alternate');
  }

  private addProcess(processName: string, id: string, label: string, cssClass: string, tooltip: string, icon: string) {
    const processSettings = this.settingsService.getProcessSettings(processName);
    const externalNode = new Map(Object.entries(this.configService.getValue('arlas.web.externalNode')));
    if (!!processSettings && !!processSettings.url && !!externalNode && externalNode.get(processName) === true) {
      this.processService.check(processName)
        .subscribe({
          next: () => {
            this.resultlistContributors.forEach(c => {
              const listActionsId = c.actionToTriggerOnClick.map(a => a.id);
              if (!listActionsId.includes(id)) {
                c.addAction({
                  id: id, label: label, cssClass: cssClass,
                  tooltip: tooltip, icon: icon
                });
                const resultConfig = this.resultlistConfigPerContId.get(c.identifier);
                if (resultConfig) {
                  if (!resultConfig.globalActionsList) {
                    resultConfig.globalActionsList = [];
                  }
                  (resultConfig.globalActionsList as Array<Action>).push({ 'id': id, 'label': label });
                };
              }
            });
          }
        });
    }
  }

  private declareResultlistExportCsv() {
    if (this.settingsService.isResultListExportEnabled()) {
      this.resultlistContributors.forEach(c => {
        const resultConfig = this.resultlistConfigPerContId.get(c.identifier);
        if (resultConfig) {
          if (!resultConfig.globalActionsList) {
            resultConfig.globalActionsList = [];
          }
          (resultConfig.globalActionsList as Array<Action>).push({ 'id': 'export_csv', 'label': marker('Export csv'), 'alwaysEnabled': true });
        }
      });
    }
  }

  private declareGlobalRasterVisualisation() {
    this.resultlistContributors.forEach(c => {
      const resultConfig = this.resultlistConfigPerContId.get(c.identifier);
      if (!!resultConfig && !!resultConfig.visualisationLink) {
        if (!resultConfig.globalActionsList) {
          resultConfig.globalActionsList = [];
        }
        const reverseAction = c.actionToTriggerOnClick.find(a => a.id === 'visualize').reverseAction;
        (resultConfig.globalActionsList as Array<Action>).push({
          id: 'visualize', label: marker('Visualize products'),
          fields: this.visualizeService.getVisuFields(resultConfig.visualisationLink), reverseAction
        });
      }
    });
  }
}
