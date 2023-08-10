import { Injectable } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { MapContributor, ElementIdentifier } from 'arlas-web-contributors';
import { MapService } from '../map.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ResultlistService } from '../resultlist.service';
import { PageQuery } from 'arlas-web-components';

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
  private subscription = new Subscription();
  public MOVE_MESSAGE = 'map-moveend';
  private FEATURES_SELECTION_MESSAGE = 'features-selection';
  private FEATURE_HOVER_MESSAGE = 'feature-hover';
  private LIST_SCROLL_MAP_RESTYLE_MESSAGE = 'list-scroll-map-restyle';
  private PAGINATE_MAP_MESSAGE = 'paginate-map';
  public constructor(
    private sharedWorkerBusService: SharedWorkerBusService,
    private mapService: MapService,
    private resultlistService: ResultlistService,
    public collaborativeService: ArlasCollaborativesearchService) {
    this.listenToExternalFeaturesSelection$();
    this.listenToExternalFeatureHover$();
    this.listenToExternalMoveend$();
    this.listenToExternalScrollMapRestyle$();
    this.listenToExternalPaginate$();
  }

  // ############# MOVEEND ###########################
  // emit moveend event of the map to other tabs when the moveend of this tab is triggered.
  public propagateMoveend(pwithinraw, pwithin) {
    this.sharedWorkerBusService.publishMessage({
      name: this.MOVE_MESSAGE,
      data: {
        pwithinraw,
        pwithin
      }
    });
  }

  public listenToExternalMoveend$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.MOVE_MESSAGE).subscribe((m: BroadcastPayload) => {
        const move = m.data as CrossMove;
        this.resultlistService.applyMapExtent(move.pwithinraw, move.pwithin);
      })
    );
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
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.FEATURES_SELECTION_MESSAGE).subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeaturesSelection;
        const mapContributor = this.mapService.getContributorByCollection(fs.collection);
        if (mapContributor) {
          this.mapService.selectFeatures(fs.idPath, fs.ids, mapContributor);
        }
      })
    );
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
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.FEATURE_HOVER_MESSAGE).subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeatureHover;
        const mapContributor = this.mapService.getContributorByCollection(fs.collection) as MapContributor;
        if (mapContributor) {
          const featureToHover = this.mapService.getFeatureToHover(fs.id, mapContributor);
          this.mapService.featureToHightLight = featureToHover;
        }
      })
    );
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
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.LIST_SCROLL_MAP_RESTYLE_MESSAGE).subscribe((m: BroadcastPayload) => {
        const data = m.data as ListScrollItems;
        this.mapService.updateMapStyle(data.items, data.collection);
      })
    );
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
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.PAGINATE_MAP_MESSAGE).subscribe((m: BroadcastPayload) => {
        const data = m.data as CrossPagination;
        this.resultlistService.paginate(data.listContributorId, data.pageQuery);
      })
    );
  }


  public terminate() {
    this.subscription.unsubscribe();
  }
}
