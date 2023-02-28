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
import { Expression, Filter, Hits, Search } from 'arlas-api';
import { CROSS_LAYER_PREFIX } from 'arlas-web-components';
import { ElementIdentifier } from 'arlas-web-contributors';
import { getElementFromJsonObject } from 'arlas-web-contributors/utils/utils';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { Popup } from 'mapbox-gl';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { parse } from 'wellknown';


@Injectable()
export class VisualizeService {
  public map;
  public fitbounds: Array<Array<number>> = [];
  public isWMTSOnMap = false;

  public constructor(public collaborativeService: ArlasCollaborativesearchService,
    private translateService: TranslateService, private snackBar: MatSnackBar
  ) { }

  public setMap(m) {
    this.map = m;
    this.map.loadImage(
      'assets/cross.png',
      (error, image) => {
        if (error) {
          throw error;
        }
        if (!this.map.hasImage('cross')) {
          this.map.addImage('cross', image);
        }
      });
  }

  public getVisuInfo(elementidentifier: ElementIdentifier, collection: string, urlTemplate: string):
    Observable<string> {

    const search: Search = {
      page: { size: 1 },
      form: { pretty: false, flat: true }
    };
    const expression: Expression = {
      field: elementidentifier.idFieldName,
      op: Expression.OpEnum.Eq,
      value: elementidentifier.idValue
    };
    const filterExpression: Filter = {
      f: [[expression]]
    };
    const searchResult = this.collaborativeService
      .resolveHits([projType.search, search],
        this.collaborativeService.collaborations,
        collection,
        null,
        filterExpression,
        true);
    return searchResult.pipe(map(data => {
      if (urlTemplate.indexOf('{') < 0) {
        return urlTemplate;
      } else {
        const fields = urlTemplate.split(/[{}]/).filter(v => v.length > 0);
        fields
          .filter(f => f !== 'x')
          .filter(f => f !== 'y')
          .filter(f => f !== 'z').forEach(field => {
            if (data.hits[0].data[field] === undefined) {
              return undefined;
            } else {
              urlTemplate = urlTemplate.replace('{' + field + '}', data.hits[0].data[field]);
            }
          });
      }
      return urlTemplate;
    }));
  }

  public removeWMTS(id?: string) {
    if (id) {
      if (this.map.getLayer('wmts-layer-' + id)) {
        this.map.removeLayer('wmts-layer-' + id);
      }
      if (this.map.getSource('wmts-source-' + id)) {
        this.map.removeSource('wmts-source-' + id);
      }
      if (this.map.getLayer(CROSS_LAYER_PREFIX + id)) {
        this.map.removeLayer(CROSS_LAYER_PREFIX + id);
      }
      if (this.map.getSource(CROSS_LAYER_PREFIX + id)) {
        this.map.removeSource(CROSS_LAYER_PREFIX + id);
      }
    } else {
      this.map.getStyle().layers
        .filter(layer => layer.source !== undefined)
        .filter(layer => layer.source.indexOf('wmts-source-') >= 0 || layer.source.indexOf(CROSS_LAYER_PREFIX) >= 0)
        .forEach(layer => {
          this.map.removeLayer(layer.id);
          this.map.removeSource(layer.source);
        });
      this.isWMTSOnMap = false;
    }
  }

  public addWMTS(urlWmts, maxZoom, bounds: Array<number>, id: string, beforeId?: string) {
    if (this.map.getLayer('wmts-layer-' + id)) {
      this.map.removeLayer('wmts-layer-' + id);
    }
    if (this.map.getSource('wmts-source-' + id)) {
      this.map.removeSource('wmts-source-' + id);
    }
    this.map.addSource('wmts-source-' + id, {
      type: 'raster',
      tiles: [urlWmts],
      bounds: bounds,
      maxzoom: maxZoom,
      tileSize: 256
    });
    this.map.addLayer({
      'id': 'wmts-layer-' + id,
      'type': 'raster',
      'source': 'wmts-source-' + id,
      'paint': {},
      'layout': {
        'visibility': 'visible'
      }
    }, beforeId);
    if (id !== 'external') {
      this.isWMTSOnMap = true;
    }

    this.addcrossToRemove(bounds[2], bounds[3], id);
  }

  public displayDataOnMap(url: string, elementidentifier: ElementIdentifier,
    geometryPath: string, centroidPath: string, collection) {
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
          this.addWMTS(url, 25, d.box, elementidentifier.idValue);
          this.fitbounds = d.bounds;
        });
    } else {
      const snackMsg = this.translateService.instant('The visualisation is not available for this product.');
      this.snackBar.open(snackMsg, undefined, { duration: 3000 });
    }
  }

  public addcrossToRemove(lat, lng, id) {
    this.map.addSource(CROSS_LAYER_PREFIX + id, {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [lat, lng]
            }
          }
        ]
      }
    });
    this.map.addLayer({
      'id': CROSS_LAYER_PREFIX + id,
      'type': 'symbol',
      'source': CROSS_LAYER_PREFIX + id,
      'layout': {
        'icon-image': 'cross',
        'icon-size': 0.25,
        'visibility': 'visible'
      }
    });
    this.map.on('click', CROSS_LAYER_PREFIX + id, (e) => {
      this.removeWMTS(id);
      // Remove button 'remove all wmts' if no more wmts left on the map
      this.isWMTSOnMap = this.map.getStyle().layers
        .filter(layer => layer.source !== undefined)
        .filter(layer => layer.source.indexOf('wmts-source-') >= 0 || layer.source.indexOf(CROSS_LAYER_PREFIX) >= 0).length > 0;
    });
    this.map.on('mousemove', CROSS_LAYER_PREFIX + id, (e) => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', CROSS_LAYER_PREFIX + id, (e) => {
      this.map.getCanvas().style.cursor = '';
    });
    this.handlePopup(lat, lng, id);
  }

  public handlePopup(lat, lng, id) {
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false
    });
    this.map.on('mouseenter', CROSS_LAYER_PREFIX + id, (e) => {
      const tooltipMsg = this.translateService.instant('Remove visualisation');
      popup.setLngLat([lat, lng])
        .setHTML(tooltipMsg)
        .addTo(this.map);
    });
    this.map.on('mouseleave', CROSS_LAYER_PREFIX + id, () => {
      popup.remove();
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
          center: !!geojsonCenter.coordinates ? geojsonCenter.coordinates : [geojsonCenter.lon, geojsonCenter.lat],
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
}
