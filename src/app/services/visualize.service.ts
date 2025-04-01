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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import bbox from '@turf/bbox';
import { BBox } from '@turf/helpers';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import { flattenedMatchAndReplace } from 'app/tools/cog';
import { getItem } from 'app/tools/utils';
import { Expression, Filter, Search } from 'arlas-api';
import { AbstractArlasMapGL, ArlasPaint, ArlasMapFrameworkService, CROSS_LAYER_PREFIX, VectorStyleEnum, VectorStyle } from 'arlas-map';
import { ElementIdentifier } from 'arlas-web-contributors';
import { getElementFromJsonObject } from 'arlas-web-contributors/utils/utils';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { parse } from 'wellknown';

const GEOCODING_PREVIEW_ID = 'geojson-geocoding-preview';

@Injectable()
export class VisualizeService<L, S, M> {
  public mapInstance: AbstractArlasMapGL;
  public fitbounds: Array<Array<number>> = [];
  /**  @deprecated. Use isRasterOnMap instead. */
  public isWMTSOnMap = false;
  public isRasterOnMap = false;

  /** emits the item's identifier of removed raster */
  private readonly rasterRemovedSource = new Subject<string>();
  public rasterRemoved$ = this.rasterRemovedSource.asObservable();

  public constructor(public collaborativeService: ArlasCollaborativesearchService,
    private readonly translateService: TranslateService, private readonly snackBar: MatSnackBar,
    private readonly mapFrameworkService: ArlasMapFrameworkService<L, S, M>
  ) { }

  /**
  * Sets the mapbox map object + loads the 'cross' icon to it.
  * @param m Mapbox map object.
  */
  public setMap(m: AbstractArlasMapGL) {
    this.mapInstance = m;
    this.mapFrameworkService.addImage('cross', 'assets/cross.png', m, 'Cross icon is not loaded');
  }


  public getVisuFields(urlTemplate): string[] {
    if (urlTemplate.indexOf('{') >= 0) {
      /** Fetch all elements between {} in the template. */
      const regex = new RegExp(/{([^}]+)}/g);
      const fields = [];
      const matches = [...urlTemplate.matchAll(regex)];
      if (matches) {
        matches.filter(m => !!m && Array.isArray(m) && m.length > 1).forEach(m => fields.push(m[1]));
      }
      if (fields) {
        return fields
          .filter(f => f !== 'x')
          .filter(f => f !== 'y')
          .filter(f => f !== 'z');
      }
    }
    return [];
  }

  public getVisuInfo(elementidentifier: ElementIdentifier, collection: string, urlTemplate: string):
    Observable<string> {

    const searchResult = getItem(elementidentifier, collection, this.collaborativeService);
    return searchResult.pipe(map(data => flattenedMatchAndReplace(data.hits[0].data, urlTemplate)));
  }

  /** @deprecated Use removeRasters instead. */
  public removeWMTS(id?: string) {
    this.removeRasters(id);
  }

  public removeRasters(id?: string) {
    if (id) {
      this.mapFrameworkService.removeLayer(this.mapInstance, 'raster-source-' + id);
      this.mapFrameworkService.removeLayer(this.mapInstance, CROSS_LAYER_PREFIX + id);
    } else {
      this.mapFrameworkService.removeLayersFromPattern(this.mapInstance, 'raster-source-');
      this.mapFrameworkService.removeLayersFromPattern(this.mapInstance, CROSS_LAYER_PREFIX);
    }
    this.isRasterOnMap = this.mapFrameworkService.hasLayersFromPattern(this.mapInstance, 'raster-source-');
    this.isWMTSOnMap = this.isRasterOnMap;
  }

  /** @deprecated Use add raster instead. */
  public addWMTS(urlWmts, maxZoom, bounds: Array<number>, id: string, beforeId?: string) {
    this.addRaster(urlWmts, maxZoom, bounds, id, beforeId);
  }

  /**
   *
   * @param url Url to the raster source.
   * @param maxZoom Maximum zoom level.
   * @param bounds Bounds of the raster. The source won't load tiles beyond these bounds.
   * @param id Identifier of the raster.
   * @param beforeId Insert before a given raster id.
   */
  public addRaster(url, maxZoom, bounds: Array<number>, id: string, beforeId?: string) {
    this.mapFrameworkService.removeLayer(this.mapInstance, 'raster-source-' + id);
    this.mapFrameworkService.removeLayer(this.mapInstance, CROSS_LAYER_PREFIX + id);
    this.mapFrameworkService.addRasterLayer(this.mapInstance, 'raster-source-' + id, url, bounds, maxZoom,
      /** tilesize */ 256, beforeId);
    if (id !== 'external') {
      this.isWMTSOnMap = true;
      this.isRasterOnMap = true;
    }
    this.addcrossToRemove(bounds[2], bounds[3], id);
  }

  public displayDataOnMap(url: string, elementidentifier: ElementIdentifier,
    geometryPath: string, centroidPath: string, collection: string, fitBounds = true) {
    if (url !== undefined && url.indexOf('{bbox-epsg-3857}{:bbox3857:}') >= 0) {
      url = url.replace('{:bbox3857:}', '');
    }
    if (url !== undefined && url.indexOf(':bbox3857:') >= 0) {
      url = url.replace(':bbox3857:', 'bbox-epsg-3857');
    }
    if (url) {
      this.getBoundsAndCenter(elementidentifier.idFieldName, elementidentifier.idValue,
        geometryPath, centroidPath, collection)
        .subscribe(d => {
          this.addRaster(url, 25, d.box, elementidentifier.idValue);
          if (fitBounds) {
            this.fitbounds = d.bounds;
          }
        });
    } else {
      const snackMsg = this.translateService.instant('The visualisation is not available for this product.');
      this.snackBar.open(snackMsg, undefined, { duration: 3000 });
    }
  }

  public addcrossToRemove(lat, lng, id) {
    const crossPosition = {
      type: 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [lat, lng]
          }
        }
      ]
    } as GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    this.mapFrameworkService.addIconLayer(this.mapInstance, CROSS_LAYER_PREFIX + id, 'cross', 0.25, crossPosition);
    this.mapFrameworkService.onLayerEvent('click', this.mapInstance, CROSS_LAYER_PREFIX + id, (e) => {
      this.removeRasters(id);
      this.notifyRasterRemoved(id);
    });
    this.mapFrameworkService.onLayerEvent('mousemove', this.mapInstance, CROSS_LAYER_PREFIX + id, () => {
      this.mapFrameworkService.setMapCursor(this.mapInstance, 'pointer');
    });
    this.mapFrameworkService.onLayerEvent('mouseleave', this.mapInstance, CROSS_LAYER_PREFIX + id, () => {
      this.mapFrameworkService.setMapCursor(this.mapInstance, '');
    });
    this.handlePopup(lat, lng, id);
  }

  public notifyRasterRemoved(id: string) {
    this.rasterRemovedSource.next(id);
  }

  public handlePopup(lat, lng, id) {
    const tooltipMsg = this.translateService.instant('Remove visualisation');
    const popup = this.mapFrameworkService.createPopup(lng, lat, tooltipMsg);
    this.mapFrameworkService.onLayerEvent('mouseenter', this.mapInstance, CROSS_LAYER_PREFIX + id, () => {
      this.mapFrameworkService.addPopup(this.mapInstance, popup);
    });
    this.mapFrameworkService.onLayerEvent('mouseleave', this.mapInstance, CROSS_LAYER_PREFIX + id, () => {
      this.mapFrameworkService.removePopup(this.mapInstance, popup);
    });
  }

  public getBoundsAndCenter(idField: string, idValue: string, geometryPath: string, centroidPath: string, collection): Observable<{
    bounds: Array<Array<number>>;
    center: Array<number>;
    box: BBox;
  }> {
    const search: Search = { page: { size: 1 } };
    const expression: Expression = {
      field: idField,
      op: Expression.OpEnum.Eq,
      value: idValue
    };
    const filter: Filter = {
      f: [[expression]]
    };
    const searchResult = this.collaborativeService
      .resolveHits([projType.search, search], this.collaborativeService.collaborations, collection, '', filter);
    return searchResult.pipe(
      map(h => {
        const geomData = getElementFromJsonObject(h.hits[0].data, geometryPath);
        const centerData = getElementFromJsonObject(h.hits[0].data, centroidPath);
        const geojsonData = this.getGeojsonFromEsGeom(geomData);
        const geojsonCenter = this.getGeojsonFromEsGeom(centerData);
        const box = bbox(geojsonData);
        const minX = box[0] - 0.1 / 100 * box[0];
        const minY = box[1] - 0.1 / 100 * box[1];
        const maxX = box[2] + 0.1 / 100 * box[2];
        const maxY = box[3] + 0.1 / 100 * box[3];
        return {
          bounds: [[minX, minY], [maxX, maxY]],
          center: geojsonCenter.coordinates ?? [geojsonCenter.lon, geojsonCenter.lat],
          box: box
        };
      })
    );
  }

  private getGeojsonFromEsGeom(geomData: string | String): any {
    let geojsonData = geomData;
    // Case geometryPath store WKT format
    if (typeof geomData === 'string' || geomData instanceof String) {
      geojsonData = parse(geomData);
      // if wkt parse return null, the geometryPath store text point format lat,lon
      if (geojsonData === null) {
        const lat = geomData.split(',')[0];
        const lon = geomData.split(',')[1];
        geojsonData = parse(`POINT (${lon} ${lat})`);
      }
    }
    return geojsonData;
  }

  public getBbox(geoJson: any): BBox2d {
    return bbox(geoJson) as BBox2d;
  }

  public addGeocodingPreviewLayer(geoJson: any) {
    this.mapFrameworkService.removeLayer(this.mapInstance, GEOCODING_PREVIEW_ID);
    const circlePaint: ArlasPaint = {
      'circle-radius': 4,
      'circle-stroke-width': 2,
      'circle-color': '#3bb2d0',
      'circle-stroke-color': '#3bb2d0'
    };
    const polygonPaint: ArlasPaint = { 'fill-color': '#3bb2d0', 'fill-outline-color': '#3bb2d0', 'fill-opacity': 0.1 };
    const type = (geoJson.type === 'Point') ? VectorStyleEnum.circle : VectorStyleEnum.fill;
    const paint = (geoJson.type === 'Point') ? circlePaint : polygonPaint;
    const style = new VectorStyle(type, paint);

    this.mapFrameworkService.addGeojsonLayer(this.mapInstance, GEOCODING_PREVIEW_ID, style, geoJson);

  }
  public removeGeocodingPreviewLayer() {
    this.mapFrameworkService.removeLayer(this.mapInstance, GEOCODING_PREVIEW_ID);
  }

  public handleGeojsonPreview(geojson: any) {
    this.addGeocodingPreviewLayer(geojson);
    this.mapFrameworkService.onMapEvent('zoomend', this.mapInstance, () => {
      this.removeGeocodingPreviewLayer();
    });
  }
}
