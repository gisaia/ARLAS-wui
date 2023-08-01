import { Injectable } from '@angular/core';
import { MapContributor, ElementIdentifier } from 'arlas-web-contributors';
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
  private mapComponent: MapglComponent;
  private mapComponentConfig: any;

  private highlightFeatureSource = new Subject<FeatureHover>();
  public highlightFeature$ = this.highlightFeatureSource.asObservable();

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

  public hoverFeature(f: FeatureHover) {
    this.highlightFeatureSource.next(f);
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
}
