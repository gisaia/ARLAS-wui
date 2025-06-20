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
import { AbstractArlasMapService, ArlasMapComponent, ArlasMapFrameworkService } from 'arlas-map';

export interface FeatureHover {
  isleaving: boolean;
  elementidentifier: ElementIdentifier;
};

@Injectable({
  providedIn: 'root'
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class ArlasWuiMapService<L, S, M> {
  public mapComponent: ArlasMapComponent<L, S, M>;
  private mapComponentConfig: any;
  public mapContributors: Array<MapContributor> = new Array();
  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };

  public featureToHightLight: FeatureHover;
  public featuresToSelect: Array<ElementIdentifier> = [];

  public coordinatesHaveSpace: boolean;
  public timeLineIsOpen: boolean;

  public constructor(
    private readonly mapService: ArlasMapFrameworkService<L, S, M>,
    private readonly mapLogicService: AbstractArlasMapService<L, S, M>
  ) {
  }

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

  /**
   * Get the feature to be highlighted on the map
   * @param id Identifier of the hovered element on the list.
   * @param mapContributor Map contributor used to get the feature to highlight.
   * @returns The highlighted feature.
   */
  public getFeatureToHover(id: ElementIdentifier, mapContributor: MapContributor): FeatureHover {
    const f = mapContributor.getFeatureToHightLight(id);
    f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
    return f;
  }

  /**
   * Set the featureToHightLight used as input by the map component.
   * @param id Identifier of the hovered element on the list.
   * @param mapContributor Map contributor used to get the feature to highlight.
   */
  public setFeatureToHighlight(id: ElementIdentifier, mapContributor: MapContributor) {
    this.featureToHightLight = this.getFeatureToHover(id, mapContributor);
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

  public setMapComponent(mapComponent: ArlasMapComponent<L, S, M>) {
    this.mapComponent = mapComponent;
  }

  public clearWindowData(contributor: MapContributor) {
    contributor.getConfigValue('layers_sources')
      .filter(ls => ls.source.startsWith('feature-') && ls.render_mode === FeatureRenderMode.window)
      .map(ls => ls.source)
      .forEach(source => contributor.clearData(source));
  }


  public adjustOpacityByRange(sourceIdPrefix: string, field: string,
    start: number, end: number, insideOpacity: number, outsideOpacity: number): void {
    if (this.mapComponent?.map) {
      this.mapLogicService.adjustOpacityByRange(this.mapComponent.map, sourceIdPrefix,
        field, start, end, insideOpacity, outsideOpacity);
    }
  }

  public resetOpacity(sourceIdPrefix: string): void {
    if (this.mapComponent?.map) {
      this.mapLogicService.resetOpacity(this.mapComponent.map, sourceIdPrefix);
    }
  }

  public updateMapStyle(ids: Array<string | number>, collection: string) {
    if (!!this.mapComponent && !!this.mapComponent.map && !!this.mapComponentConfig && !!this.mapComponentConfig.mapLayers.events.onHover) {
      this.mapComponentConfig.mapLayers.events.onHover.forEach(l => {
        this.mapLogicService.updateMapStyle(this.mapComponent.map, l, ids, collection);
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
    let mapCanvas = document.getElementsByClassName('mapboxgl-canvas');
    if (mapCanvas.length === 0) {
      mapCanvas = document.getElementsByClassName('maplibregl-canvas');
    }
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
