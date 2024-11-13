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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from '@services/map.service';
import { VisualizeService } from '@services/visualize.service';
import { isElementInViewport } from 'app/tools/utils';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  CellBackgroundStyleEnum, Column, ElementIdentifier, Item, ModeEnum, PageQuery, ResultListComponent, SortEnum
} from 'arlas-web-components';
import { MapContributor, ResultListContributor } from 'arlas-web-contributors';
import {
  AiasDownloadComponent, ArlasCollaborativesearchService, ArlasConfigService,
  ArlasExportCsvService, ArlasSettingsService, getParamValue, ProcessService
} from 'arlas-wui-toolkit';
import { BehaviorSubject, finalize, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ResultlistService {

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

  /** Resullist component */
  private listComponent: ResultListComponent;

  /**
   * Event emitted when an action is performed on the list
   */
  public actionOnList = new Subject<{ origin: string; event: string; data?: any; }>();

  public constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    private collaborativeService: ArlasCollaborativesearchService,
    private settingsService: ArlasSettingsService,
    private configService: ArlasConfigService,
    private processService: ProcessService,
    private exportService: ArlasExportCsvService,
    private snackbar: MatSnackBar,
    private visualizeService: VisualizeService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) { }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultlistConfigs: string[]) {
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
          if (!!sortColumn) {
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

      this.addActions();
      this.declareResultlistExportCsv();
    }
  }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public toggleList() {
    this.listOpen = !this.listOpen;
    this.listOpenChange.next(this.listOpen);
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
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
        const centroidPath = this.collectionToDescription.get(c.collection).centroid_path;
        const mapContrib = this.mapService.getContributorByCollection(c.collection);
        if (!!mapContrib) {
          c.filter = mapContrib.getFilterForCount(pwithinRaw, pwithin, centroidPath, true);
        } else {
          MapContributor.getFilterFromExtent(pwithinRaw, pwithin, centroidPath);
        }
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

  public openDetail(id: any): BehaviorSubject<boolean> {
    const isOpen = new BehaviorSubject<boolean>(false);
    // If does not work add a variable ?
    const listConfig = this.resultlistConfigPerContId.get(this.previewListContrib.identifier);
    const isListMode = listConfig.defautMode === ModeEnum.list;
    if (isListMode) {
      const detailListButton = document.getElementById('open-detail-' + id);
      if (!!detailListButton) {
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
      if (!!productTile) {
        productTile.click();
        if (!isDetailledGridOpen) {
          setTimeout(() => {
            const detailGridButton = document.getElementById('show_details_gridmode_btn');
            if (!!detailGridButton) {
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
                if (!!detailGridButton) {
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
        if (!!mapContributor) {
          const f = mapContributor.getFeatureToHightLight(event.data);
          if (mapContributor) {
            f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
          }
          this.mapService.featureToHightLight = f;
        }
        break;
      case 'selectedItemsEvent':
        const ids = event.data;
        const idPath = this.collectionToDescription.get(currentCollection)?.id_path;
        if (!!idPath) {
          this.mapService.selectFeatures(idPath, ids, mapContributor);
        }
        break;
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        if (event.data.id === 'production') {
          const idsItemSelected: ElementIdentifier[] = this.mapService.mapComponent.featuresToSelect;
          this.process(idsItemSelected.map(i => i.idValue), currentCollection);
        } else if (event.data.id === 'export_csv') {
          this.resultlistIsExporting = true;
          this.exportService.fetchResultlistData$(resultListContributor, undefined)
            .pipe(finalize(() => this.resultlistIsExporting = false))
            .subscribe({
              next: (h) => this.exportService.exportResultlist(resultListContributor, h),
              error: (e) => this.snackbar.open(marker('An error occured exporting the list'))
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

  public actionOnItemEvent(data, mapContributor: MapContributor, listContributor: ResultListContributor, collection: string) {
    switch (data.action.id) {
      case 'zoomToFeature':
        if (!!mapContributor) {
          mapContributor.getBoundsToFit(data.elementidentifier, collection)
            .subscribe(bounds => this.visualizeService.fitbounds = bounds);
        }
        break;
      case 'visualize':
        if (!!this.resultlistConfigPerContId.get(listContributor.identifier)) {
          const urlVisualisationTemplate = this.resultlistConfigPerContId.get(listContributor.identifier).visualisationLink;
          this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlVisualisationTemplate).subscribe(url => {
            this.visualizeService.displayDataOnMap(url,
              data.elementidentifier, this.collectionToDescription.get(collection).geometry_path,
              this.collectionToDescription.get(collection).centroid_path, collection);
          });
        }
        break;
      case 'download':
        if (!!this.resultlistConfigPerContId.get(listContributor.identifier)) {
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
        this.process([data.elementidentifier.idValue], collection);
        break;
    }
  }

  public setListComponent(listComponent: ResultListComponent) {
    this.listComponent = listComponent;
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

  private process(ids: string[], collection: string) {
    const maxItems = this.settingsService.getProcessSettings().max_items;
    if (ids.length <= maxItems) {
      this.processService.load().subscribe({
        next: () => {
          this.processService.getItemsDetail(
            this.collectionToDescription.get(collection).id_path,
            ids,
            collection
          ).subscribe({
            next: (item: any) => {
              this.dialog
                .open(AiasDownloadComponent, {
                  minWidth: '520px',
                  maxWidth: '60vw',
                  data: {
                    ids,
                    collection,
                    nbProducts: ids.length,
                    itemDetail: item,
                    wktAoi: this.mapService.mapComponent.getAllPolygon('wkt')
                  }
                });
            }
          });
        }
      });
    } else {
      this.snackbar.open(
        this.translate.instant('You have exceeded the number of products authorised for a single download', { max: maxItems }), 'X',
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 5000
        }
      );
    }
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
      if (!!mapcontributor && !listActionsId.includes('zoomToFeature')) {
        c.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '', tooltip: marker('Zoom to product') });
      }
      if (!!this.resultlistConfigPerContId.get(c.identifier)) {
        if (!!this.resultlistConfigPerContId.get(c.identifier).visualisationLink && !listActionsId.includes('visualize')) {
          c.addAction({ id: 'visualize', label: 'Visualize', cssClass: '', tooltip: marker('Visualize on the map') });
        }
        if (!!this.resultlistConfigPerContId.get(c.identifier).downloadLink && !listActionsId.includes('download')) {
          c.addAction({ id: 'download', label: 'Download', cssClass: '', tooltip: marker('Download') });
        }
      }
    });

    // Check if the user can access process endpoint
    const processSettings = this.settingsService.getProcessSettings();
    const externalNode = this.configService.getValue('arlas.web.externalNode');
    if (!!processSettings && !!processSettings.url
      && !!externalNode && !!externalNode.download && externalNode.download === true) {

      this.processService.check()
        .subscribe({
          next: () => {
            this.resultlistContributors.forEach(c => {
              const listActionsId = c.actionToTriggerOnClick.map(a => a.id);
              if (!listActionsId.includes('production')) {
                c.addAction({ id: 'production', label: 'Download', cssClass: '', tooltip: marker('Download') });
                const resultConfig = this.resultlistConfigPerContId.get(c.identifier);
                if (resultConfig) {
                  if (!resultConfig.globalActionsList) {
                    resultConfig.globalActionsList = [];
                  }
                  resultConfig.globalActionsList.push({ 'id': 'production', 'label': 'Download' });
                }
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
          resultConfig.globalActionsList.push({ 'id': 'export_csv', 'label': marker('Export csv'), 'alwaysEnabled': true });
        }
      });
    }
  }
}
