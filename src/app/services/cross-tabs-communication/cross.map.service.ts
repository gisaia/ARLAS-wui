import { Injectable } from '@angular/core';
import { ContributorService } from '@services/contributors.service';
import { MapService } from '@services/map.service';
import { ResultlistService } from '@services/resultlist.service';
import { PageQuery } from 'arlas-web-components';
import { ElementIdentifier, MapContributor, ResultListContributor } from 'arlas-web-contributors';
import { Subject, takeUntil } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';

export interface CrossMove {
  pwithinraw: string;
  pwithin: string;
}
export interface CrossFeaturesSelection {
  idPath: string;
  ids: string[] | number[];
  collection: string;
}

export interface CrossFeatureHover {
  id: ElementIdentifier;
  collection: string;
}

export interface ListScrollItems {
  items: string[];
  collection: string;
}

export interface CrossPagination {
  listContributorId: string;
  pageQuery: PageQuery;
}

@Injectable()
export class CrossMapService {
  private _onTerminate$ = new Subject<boolean>();
  public MOVE_MESSAGE = 'map-moveend';
  private FEATURES_SELECTION_MESSAGE = 'features-selection';
  private FEATURE_HOVER_MESSAGE = 'feature-hover';
  private LIST_SCROLL_MAP_RESTYLE_MESSAGE = 'list-scroll-map-restyle';
  private PAGINATE_MAP_MESSAGE = 'paginate-map';

  public constructor(
    private sharedWorkerBusService: SharedWorkerBusService,
    private mapService: MapService,
    private resultlistService: ResultlistService,
    // private collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService
  ) {
    this.listenToExternalFeaturesSelection$();
    this.listenToExternalFeatureHover$();
    this.listenToExternalMoveend$();
    this.listenToExternalScrollMapRestyle$();
    this.listenToExternalPaginate$();
  }

  // ############# MOVEEND ###########################
  // emit moveend event of the map to other tabs when the moveend of this tab is triggered.
  public propagateMoveend(pwithinraw: string, pwithin: string) {
    this.sharedWorkerBusService.publishMessage({
      name: this.MOVE_MESSAGE,
      data: {
        pwithinraw,
        pwithin
      }
    });
  }

  public listenToExternalMoveend$() {
    this.sharedWorkerBusService.payloadOfName(this.MOVE_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        const move = m.data as CrossMove;
        this.resultlistService.applyMapExtent(move.pwithinraw, move.pwithin);
      });
  }


  // ############# FEATURES SELECTION ###########################
  public propagateFeaturesSelection(idPath: string, ids: string[] | number[], collection: string) {
    this.sharedWorkerBusService.publishMessage({
      name: this.FEATURES_SELECTION_MESSAGE,
      data: {
        idPath,
        ids,
        collection
      }
    });
  }

  public listenToExternalFeaturesSelection$() {
    this.sharedWorkerBusService.payloadOfName(this.FEATURES_SELECTION_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeaturesSelection;
        const mapContributor = this.mapService.getContributorByCollection(fs.collection);
        if (mapContributor) {
          this.mapService.selectFeatures(fs.idPath, fs.ids, mapContributor);
        }
      });
  }

  // ############# FEATURE HOVER ###########################
  public propagateFeatureHover(id: ElementIdentifier, collection: string) {
    this.sharedWorkerBusService.publishMessage({
      name: this.FEATURE_HOVER_MESSAGE,
      data: {
        id,
        collection
      }
    });
  }

  public listenToExternalFeatureHover$() {
    this.sharedWorkerBusService.payloadOfName(this.FEATURE_HOVER_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeatureHover;
        const mapContributor = this.mapService.getContributorByCollection(fs.collection) as MapContributor;
        if (mapContributor) {
          const featureToHover = this.mapService.getFeatureToHover(fs.id, mapContributor);
          this.mapService.featureToHightLight = featureToHover;
        }
      });
  }

  // ############# SCROLL RESTYLING ###########################
  public propagateScrollMapRestyle(items: string[], collection) {
    this.sharedWorkerBusService.publishMessage({
      name: this.LIST_SCROLL_MAP_RESTYLE_MESSAGE,
      data: {
        items,
        collection
      }
    });
  }

  public listenToExternalScrollMapRestyle$() {
    this.sharedWorkerBusService.payloadOfName(this.LIST_SCROLL_MAP_RESTYLE_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        const data = m.data as ListScrollItems;
        this.mapService.updateMapStyle(data.items, data.collection);
      });
  }

  // ############# PAGINATE ###########################
  public propagatePaginate(listContributorId: string, pageQuery: PageQuery) {
    this.sharedWorkerBusService.publishMessage({
      name: this.PAGINATE_MAP_MESSAGE,
      data: {
        listContributorId,
        pageQuery
      }
    });
  }

  public listenToExternalPaginate$() {
    this.sharedWorkerBusService.payloadOfName(this.PAGINATE_MAP_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        const data = m.data as CrossPagination;
        this.resultlistService.paginate(
          this.contributorService.getContributor(data.listContributorId) as ResultListContributor,
          data.pageQuery);
      });
  }


  public terminate() {
    this._onTerminate$.next(true);
    this._onTerminate$.complete();
  }
}
