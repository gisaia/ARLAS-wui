import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Subscription } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { MapContributor, ElementIdentifier } from 'arlas-web-contributors';
import { MapService } from '../map.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

export interface Move {
  center: mapboxgl.LngLat;
  zoom: number;
}
export interface CrossFeaturesSelection {
  idPath: string;
  ids: string[] | number[];
  mapContributorId: string;
}

export interface CrossFeatureHover {
  id: ElementIdentifier;
  mapContributorId: string;
}

@Injectable()
export class CrossMapService {
  private subscription = new Subscription();
  private MOVE_MESSAGE = 'map-moveend';
  private FEATURES_SELECTION_MESSAGE = 'features-selection';
  private FEATURE_HOVER_MESSAGE = 'feature-hover';
  private canPropagateMoveend = false;

  public constructor(
    private sharedWorkerBusService: SharedWorkerBusService,
    private mapService: MapService,
    public collaborativeService: ArlasCollaborativesearchService) {
    this.listenToExternalFeaturesSelection$();
    this.listenToExternalFeatureHover$();
  }

  // ############# MOVEEND ###########################
  // emit moveend event of the map to other tabs when the moveend of this tab is triggered.
  public propagateMoveend(bounds: mapboxgl.LngLatBounds) {
    if (this.canPropagateMoveend) {
      this.sharedWorkerBusService.publishMessage({
        name: this.MOVE_MESSAGE,
        data: bounds
      });
    }
    this.allowMyMoveendPropagation();
  }

  public listenToExternalMoveend$(map: mapboxgl.Map) {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.MOVE_MESSAGE).subscribe((m: BroadcastPayload) => {
        const move = m.data as Move;;
        this.forbidMyMoveendPropagation();
        map.fitBounds([
          m.data._sw,
          m.data._ne
        ], { duration: 0 });
      })
    );
  }

  public allowMyMoveendPropagation() {
    this.canPropagateMoveend = true;
  }

  public forbidMyMoveendPropagation() {
    this.canPropagateMoveend = false;
  }

  // ############# FEATURES SELECTION ###########################
  public propagateFeaturesSelection(idPath: string, ids: string[] | number[], mapContributorId: string) {
    this.sharedWorkerBusService.publishMessage({
      name: this.FEATURES_SELECTION_MESSAGE,
      data: {
        idPath,
        ids,
        mapContributorId
      }
    });
  }

  public listenToExternalFeaturesSelection$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.FEATURES_SELECTION_MESSAGE).subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeaturesSelection;
        const mapContributor = this.collaborativeService.registry.get(fs.mapContributorId) as MapContributor;
        this.mapService.selectFeatures(fs.idPath, fs.ids, mapContributor);
      })
    );
  }

  // ############# FEATURE HOVER ###########################
  public propagateFeatureHover(id: ElementIdentifier, mapContributorId: string) {
    this.sharedWorkerBusService.publishMessage({
      name: this.FEATURE_HOVER_MESSAGE,
      data: {
        id,
        mapContributorId
      }
    });
  }

  public listenToExternalFeatureHover$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.FEATURE_HOVER_MESSAGE).subscribe((m: BroadcastPayload) => {
        const fs = m.data as CrossFeatureHover;
        const mapContributor = this.collaborativeService.registry.get(fs.mapContributorId) as MapContributor;
        const featureToHover = this.mapService.getFeatureToHover(fs.id, mapContributor);
        this.mapService.featureToHightLight = featureToHover;
      })
    );
  }

  public terminate() {
    this.subscription.unsubscribe();
  }
}
