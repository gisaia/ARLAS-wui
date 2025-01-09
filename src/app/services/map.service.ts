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
import { ElementIdentifier, FeatureRenderMode, MapContributor } from 'arlas-web-contributors';
import { ArlasMapComponent, AbstractArlasMapService, ArlasMapFrameworkService } from 'arlas-map';
export interface FeatureHover {
  isleaving: boolean;
  elementidentifier: ElementIdentifier;
};

@Injectable({
  providedIn: 'root'
})
export class MapWuiService {
  public mapComponent: ArlasMapComponent<any, any, any>;
  private mapComponentConfig: any;
  public mapContributors: Array<MapContributor> = new Array();
  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };

  public featureToHightLight: FeatureHover;
  public featuresToSelect: Array<ElementIdentifier> = [];

  public coordinatesHaveSpace: boolean;

  public constructor(public mapService: ArlasMapFrameworkService<any, any, any>, public mapLogicService: AbstractArlasMapService<any, any, any>) { }

  public setContributors(mapContributors: Array<MapContributor>) {
    this.mapContributors = mapContributors;
  }

  public selectFeatures(idPath: string, ids: string[] | number[], mapContributor: MapContributor) {
    if (!!this.mapComponent && !!mapContributor) {
      if (ids.length > 0) {
        this.featuresToSelect = ids.map(id => {
          let idFieldName = idPath;
          if (mapContributor.isFlat) {
            idFieldName = idFieldName.replace(/\./g, '_');
          }
          return {
            idFieldName: idFieldName,
            idValue: id
          };
        });
        this.mapComponent.selectFeaturesByCollection(this.featuresToSelect, mapContributor.collection);
      } else {
        this.mapComponent.selectFeaturesByCollection([], mapContributor.collection);
      }
    }
  }

  public getFeatureToHover(id: ElementIdentifier, mapContributor: MapContributor): FeatureHover {
    const f = mapContributor.getFeatureToHightLight(id);
    if (mapContributor) {
      f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
    }
    return f;
  }

  public setMapConfig(mapComponentConfig) {
    this.mapComponentConfig = mapComponentConfig;
  }

  public getMapConfig() {
    return this.mapComponentConfig;
  }

  public setCursor(cursor: string) {
    this.mapService.setMapCursor(this.mapComponent.map, cursor);
  }

  public setMapComponent(mapComponent: ArlasMapComponent<any, any, any>) {
    this.mapComponent = mapComponent;
  }

  public clearWindowData(contributor: MapContributor) {
    contributor.getConfigValue('layers_sources')
      .filter(ls => ls.source.startsWith('feature-') && ls.render_mode === FeatureRenderMode.window)
      .map(ls => ls.source)
      .forEach(source => contributor.clearData(source));
  }

  public updateMapStyle(ids: Array<string | number>, collection: string) {
    if (!!this.mapComponent && !!this.mapComponent.map && !!this.mapComponentConfig && !!this.mapComponentConfig.mapLayers.events.onHover) {
      this.mapComponentConfig.mapLayers.events.onHover.forEach(l => {
        this.mapLogicService.updateMapStyle(this.mapComponent.map, l, ids, collection  );
      });
    }
  }

  public resize() {
    this.mapComponent?.map?.resize();
    this.adjustCoordinates();
  }

  public adjustCoordinates(): void {
    const timelineToolsMaxWidth = 420;
    const scaleMaxWidth = 100;
    const toggleButtonWidth = 24;
    const smMargin = 5;
    const mapCanvas = document.getElementsByClassName('mapboxgl-canvas');
    if (mapCanvas && mapCanvas.length > 0) {
      const bbox = mapCanvas[0].getBoundingClientRect();
      if (bbox) {
        const width = bbox.width;
        this.coordinatesHaveSpace = (width - timelineToolsMaxWidth - scaleMaxWidth - toggleButtonWidth - 3 * smMargin) > 230;
      }
    }
  }

  public getContributorByCollection(collection: string): MapContributor {
    let mapContributor: MapContributor;
    if (this.mapContributors) {
      mapContributor = this.mapContributors.find(mc => mc.collection === collection);
    }
    return mapContributor;
  }

  public getContributorById(identifier: string): MapContributor {
    let mapContributor: MapContributor;
    if (this.mapContributors) {
      mapContributor = this.mapContributors.find(mc => mc.identifier === identifier);
    }
    return mapContributor;
  }
}
