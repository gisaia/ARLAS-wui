import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionReferenceParameters } from 'arlas-api';
import { CellBackgroundStyleEnum, ModeEnum, ResultListComponent, SortEnum } from 'arlas-web-components';
import { MapContributor, ResultListContributor } from 'arlas-web-contributors';
import { ArlasCollaborativesearchService, getParamValue } from 'arlas-wui-toolkit';
import { BehaviorSubject } from 'rxjs';
import { MapService } from './map.service';


@Injectable({
  providedIn: 'root'
})
export class ResultlistService {

  public resultlistContributors: Array<ResultListContributor> = new Array();
  public resultlistConfigs = [];
  public resultlistConfigPerContId = new Map<string, any>();
  public previewlistContrib: ResultListContributor = null;
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public isGeoSortActivated = new Map<string, boolean>();
  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();

  public resultListComponent: ResultListComponent;
  public selectedListTabIndex = 0;
  public listOpen = false;

  private currentClickedFeatureId: string = undefined;

  public constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    private collaborativeService: ArlasCollaborativesearchService
  ) {
    const resultlistOpenString = getParamValue('ro');
    if (resultlistOpenString) {
      this.listOpen = (resultlistOpenString === 'true');
    }
  }

  public setResultlistComponent(c: ResultListComponent) {
    this.resultListComponent = c;
  }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultlistConfigs: string[]) {
    this.resultlistContributors = resultlistContributors;
    if (this.resultlistContributors.length > 0) {
      this.resultlistConfigs = resultlistConfigs;

      this.resultlistConfigs.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultlistConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });
    }
  }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public toggleList() {
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public isThumbnailProtected(): boolean {
    return this.resultlistContributors[this.selectedListTabIndex].fieldsConfiguration?.useHttpThumbnails ?? false;
  }

  public applyMapExtent(pwithinRaw: string, pwithin: string) {
    this.resultlistContributors
      .forEach(c => {
        const centroidPath = this.collectionToDescription.get(c.collection).centroid_path;
        const mapContrib = this.mapService.getContributorByCollection(c.collection);
        if (!!mapContrib) {
          c.filter = mapContrib.getFilterForCount(pwithinRaw, pwithin, centroidPath);
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

  public openDetail$(id: any): BehaviorSubject<boolean> {
    const isOpen = new BehaviorSubject<boolean>(false);
    // If does not work add a variable ?
    const isListMode = this.resultListComponent.resultMode === ModeEnum.list;
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
      const isDetailledGridOpen = this.resultListComponent.isDetailledGridOpen;
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
}
