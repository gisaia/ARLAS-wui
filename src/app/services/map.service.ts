import { Injectable } from '@angular/core';
import { MapContributor, ElementIdentifier, FeatureRenderMode } from 'arlas-web-contributors';
import { MapglComponent } from 'arlas-web-components';
import { Subject } from 'rxjs';

export interface FeatureHover {
  isleaving: boolean;
  elementidentifier: {
    idFieldName: string;
    idValue: string;
  };
};

@Injectable()
export class MapService {
  public mapComponent: MapglComponent;
  private mapComponentConfig: any;
  public mapContributors: Array<MapContributor> = new Array();
  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };
  public featureToHightLight: FeatureHover;

  public setContributors(mapContributors: Array<MapContributor>) {
    this.mapContributors = mapContributors;
  }


  public selectFeatures(idPath: string, ids: string[] | number[], mapContributor: MapContributor) {
    /** TODO : manage features to select when we have miltiple collections */
    if (ids.length > 0 && this.mapComponentConfig && mapContributor) {
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
      if (!!this.mapComponent) {
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
    if (!!this.mapComponentConfig && !!this.mapComponentConfig.mapLayers.events.onHover) {
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
}
