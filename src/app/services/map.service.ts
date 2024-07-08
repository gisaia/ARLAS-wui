import { Injectable } from '@angular/core';
import { MapglComponent } from 'arlas-web-components';
import { ElementIdentifier, FeatureRenderMode, MapContributor } from 'arlas-web-contributors';

export interface FeatureHover {
  isleaving: boolean;
  elementidentifier: ElementIdentifier;
};

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public mapComponent: MapglComponent;
  private mapComponentConfig: any;
  public mapContributors: Array<MapContributor> = new Array();
  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };
  public featureToHightLight: FeatureHover;
  public coordinatesHaveSpace: boolean;

  public constructor() { }

  public setContributors(mapContributors: Array<MapContributor>) {
    this.mapContributors = mapContributors;
  }

  public selectFeatures(idPath: string, ids: string[] | number[], mapContributor: MapContributor) {
    /** TODO : manage features to select when we have multiple collections */
    if (!!this.mapComponent && !!mapContributor) {
      if (ids.length > 0) {
        const featuresToSelect = ids.map(id => {
          let idFieldName = idPath;
          if (mapContributor.isFlat) {
            idFieldName = idFieldName.replace(/\./g, '_');
          }
          return {
            idFieldName: idFieldName,
            idValue: id
          };
        });
        this.mapComponent.selectFeaturesByCollection(featuresToSelect, mapContributor.collection);
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
    this.mapComponent.map.getCanvas().style.cursor = cursor;
  }

  public setMapComponent(mapComponent: MapglComponent) {
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
        const layer = this.mapComponent.map.getLayer(l);
        if (ids && ids.length > 0) {
          if (!!layer && layer.source.indexOf(collection) >= 0 && ids.length > 0 &&
            (layer.metadata.isScrollableLayer || layer.metadata['is-scrollable-layer'])) {
            this.mapComponent.map.setFilter(l, this.getVisibleElementLayerFilter(l, ids));
            const strokeLayerId = l.replace('_id:', '-fill_stroke-');
            const strokeLayer = this.mapComponent.map.getLayer(strokeLayerId);
            if (!!strokeLayer) {
              this.mapComponent.map.setFilter(strokeLayerId, this.getVisibleElementLayerFilter(strokeLayerId, ids));
            }
          }
        } else {
          if (!!layer && layer.source.indexOf(collection) >= 0) {
            this.mapComponent.map.setFilter(l, this.mapComponent.layersMap.get(l).filter);
            const strokeLayerId = l.replace('_id:', '-fill_stroke-');
            const strokeLayer = this.mapComponent.map.getLayer(strokeLayerId);
            if (!!strokeLayer) {
              this.mapComponent.map.setFilter(strokeLayerId,
                this.mapComponent.layersMap.get(strokeLayerId).filter);
            }
          }
        }
      });
    }
  }

  public resize() {
    this.mapComponent.map?.resize();
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

  private getVisibleElementLayerFilter(l, ids) {
    const lFilter = this.mapComponent.layersMap.get(l).filter;
    const filters = [];
    if (lFilter) {
      lFilter.forEach(f => {
        filters.push(f);
      });
    }
    if (filters.length === 0) {
      filters.push('all');
    }
    filters.push([
      'match',
      ['get', 'id'],
      Array.from(new Set(ids)),
      true,
      false
    ]);
    return filters;
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
