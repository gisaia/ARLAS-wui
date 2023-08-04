import { Injectable } from '@angular/core';
import { ResultListContributor, MapContributor, ElementIdentifier } from 'arlas-web-contributors';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  SortEnum, CellBackgroundStyleEnum, Item
} from 'arlas-web-components';
import { getParamValue, isElementInViewport } from 'app/tools/utils';
import { VisualizeService } from './visualize.service';
import { Subject } from 'rxjs';
import { MapService } from './map.service';
import { CrossMapService } from './cross-tabs-communication/cross.map.service';
import {
  Column, PageQuery
} from 'arlas-web-components';
@Injectable()
export class ResultlistService {
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public isGeoSortActivated = new Map<string, boolean>();
  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();
  public rightListContributors: Array<ResultListContributor> = new Array();
  public resultListsConfig = [];
  public resultListConfigPerContId = new Map<string, any>();
  public previewListContrib: ResultListContributor = null;
  public actionOnList = new Subject<{ origin: string; event: string; data?: any; }>();

  public constructor(
    public crossMapService: CrossMapService,
    public mapService: MapService,
    public visualizeService: VisualizeService) {

  }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultListsConfig: string[]) {
    this.resultlistContributors = resultlistContributors;
    if (this.resultlistContributors.length > 0) {
      this.resultListsConfig = resultListsConfig;
      this.rightListContributors = this.resultlistContributors
        .filter(c => this.resultListsConfig.some((rc) => c.identifier === rc.contributorId))
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

      this.resultListsConfig.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultListConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });
      const selectedResultlistTab = getParamValue('rt');
      const previewListContrib = this.rightListContributors.find(r => r.getName() === decodeURI(selectedResultlistTab));
      if (previewListContrib) {
        this.previewListContrib = previewListContrib;
      } else {
        this.previewListContrib = this.rightListContributors[0];
      }
    }

  }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
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

  public actionOnItemEvent(data, mapContributor, listContributor, collection) {
    switch (data.action.id) {
      case 'zoomToFeature':
        if (!!mapContributor) {
          mapContributor.getBoundsToFit(data.elementidentifier, collection)
            .subscribe(bounds => this.visualizeService.fitbounds = bounds);
        }
        break;
      case 'visualize':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlVisualisationTemplate = this.resultListConfigPerContId.get(listContributor.identifier).visualisationLink;
          this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlVisualisationTemplate).subscribe(url => {
            this.visualizeService.displayDataOnMap(url,
              data.elementidentifier, this.collectionToDescription.get(collection).geometry_path,
              this.collectionToDescription.get(collection).centroid_path, collection);
          });
        }
        break;
      case 'download':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlDownloadTemplate = this.resultListConfigPerContId.get(listContributor.identifier).downloadLink;
          if (urlDownloadTemplate) {
            this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlDownloadTemplate).subscribe(url => {
              const win = window.open(url, '_blank');
              win.focus();
            });
          }
        }
        break;
    }
  }
  public getBoardEvents(event: { origin: string; event: string; data?: any; }) {
    const resultListContributor = this.rightListContributors.find(r => r.identifier === event.origin);
    const currentCollection = resultListContributor.collection;
    const mapContributor: MapContributor = this.mapService.mapContributors.filter(c => c.collection === currentCollection)[0];
    switch (event.event) {
      case 'paginationEvent':
        this.paginate(resultListContributor, event.data);
        break;
      case 'sortColumnEvent':
        this.sortColumnEvent(event.origin, event.data);
        break;
      case 'consultedItemEvent':
        if (!!mapContributor) {
          const id = event.data as ElementIdentifier;
          this.mapService.featureToHightLight = this.mapService.getFeatureToHover(id, mapContributor);
          this.crossMapService.propagateFeatureHover(id, mapContributor.identifier);
        }
        break;
      case 'selectedItemsEvent':
        const ids = event.data;
        const idPath = this.collectionToDescription.get(currentCollection).id_path;
        this.mapService.selectFeatures(idPath, ids, mapContributor);
        this.crossMapService.propagateFeaturesSelection(idPath, ids, mapContributor.identifier);
        break;
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        break;
      case 'geoSortEvent':
        break;
      case 'geoAutoSortEvent':
        this.onActiveOnGeosort(event.data, resultListContributor, mapContributor,
          this.mapService.centerLatLng.lat, this.mapService.centerLatLng.lng);
        break;
    }
    this.actionOnList.next(event);
  }
  public onActiveOnGeosort(data, resultListContributor: ResultListContributor, mapContributor: MapContributor, lat, lng): void {
    this.isGeoSortActivated.set(resultListContributor.identifier, data);
    if (data) {
      /** Apply geosort in list */
      resultListContributor.geoSort(lat, lng, true);
      this.sortOutput.delete(resultListContributor.identifier);
      // this.resultListComponent.columns.filter(c => !c.isIdField).forEach(c => c.sortDirection = SortEnum.none);
      /** Apply geosort in map (for simple mode) */
      this.mapService.clearWindowData(mapContributor);
      mapContributor.searchSort = resultListContributor.geoOrderSort;
      mapContributor.searchSize = resultListContributor.pageSize;
      mapContributor.drawGeoSearch(0, true);
    } else {
      const idFieldName = resultListContributor.getConfigValue('fieldsConfiguration')['idFieldName'];
      this.sortOutput.set(resultListContributor.identifier,
        { fieldName: idFieldName, sortDirection: SortEnum.none });
      /** Sort the list by the selected column and the id field name */
      resultListContributor.sortColumn({ fieldName: idFieldName, sortDirection: SortEnum.none }, true);
      mapContributor.searchSort = resultListContributor.sort;
      mapContributor.searchSize = resultListContributor.pageSize;
      this.mapService.clearWindowData(mapContributor);
      mapContributor.drawGeoSearch(0, true);
    }
  }
  /** This method sorts the list on the given column. The features are also sorted if the `Simple mode` is activated in mapContributor  */
  public sortColumnEvent(contributorId: string, sortOutput: Column) {
    const resultlistContributor = this.rightListContributors.find(r => r.identifier === contributorId);
    this.isGeoSortActivated.set(contributorId, false);
    /** Save the sorted column */
    this.sortOutput.set(contributorId, sortOutput);
    /** Sort the list by the selected column and the id field name */
    resultlistContributor.sortColumn(sortOutput, true);
    /** set mapcontritbutor sort */
    let sortOrder = null;
    if (sortOutput.sortDirection.toString() === '0') {
      sortOrder = '';
    } else if (sortOutput.sortDirection.toString() === '1') {
      sortOrder = '-';
    }
    let sort = '';
    if (sortOrder !== null) {
      sort = sortOrder + sortOutput.fieldName;
    }

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

  /**
   * Called at the end of scrolling the list
   * @param contributor ResultlistContributor instance that fetches the data
   * @param eventPaginate Which page is queried
   */
  public paginate(contributor, eventPaginate: PageQuery): void {
    contributor.getPage(eventPaginate.reference, eventPaginate.whichPage);
    const sort = this.isGeoSortActivated.get(contributor.identifier) ? contributor.geoOrderSort : contributor.sort;
    this.mapService.mapContributors
      .filter(c => c.collection === contributor.collection)
      .forEach(c => c.getPage(eventPaginate.reference, sort, eventPaginate.whichPage, contributor.maxPages));
  }

  public updateVisibleItems() {
    const idFieldName = this.collectionToDescription.get(this.previewListContrib.collection).id_path;
    setTimeout(() => {
      const visibleItems = this.previewListContrib.data.map(i => (i.get(idFieldName) as number | string))
        .filter(i => i !== undefined && isElementInViewport(document.getElementById(i.toString())));
      this.mapService.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }, 500);
  }

  public updateMapStyleFromScroll(items: Array<Item>, collection: string) {
    this.mapService.updateMapStyle(items.map(i => i.identifier), collection);
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
}
