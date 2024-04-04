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


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ArlasSettingsService} from 'arlas-wui-toolkit';

export interface GeocodingQueryParams {
  q: string;
  'accept-language': string;
  format?: 'xml' | 'json' | 'jsonv2' | 'geojson' | 'geocodejson';
  limit?: number;
  polygonOutput?: { type: 'polygon_geojson'; value: 0 | 1; };
}

// attribute is in lowerCase to map nominatim output
export interface GeocodingResult {
  display_name: string;
  lat: number;
  lon: number;
  boundingbox: number[];
  addresstype: string;
  geojson: GeoJson;
}

export interface GeoJson { type: string; coordinates: any; }

@Injectable({providedIn: 'root'})
export class GeocodingService {
  public constructor(
    private http: HttpClient,
    private arlasSettingsService: ArlasSettingsService
  ) {
  }

  public findLocations(geocodingQuery: GeocodingQueryParams): Observable<GeocodingResult[]> {
    return this.sendRequest(this.buildSearchUrl(geocodingQuery))
      .pipe(map(result => {
        if (!result) {
          return [];
        }
        return result;
      }));
  }

  private buildSearchUrl(query: GeocodingQueryParams): string {
    let url = `${this.arlasSettingsService.getGeocodingSettings().find_place_url}/search?q=${query.q}`;
    url += `&accept-language=${query['accept-language']}`;
    url += `&limit=${query.limit ?? 20}`;
    url += `&format=${query.format ?? 'jsonv2'}`;
    url += (query.polygonOutput) ? `&${query.polygonOutput.type}=${query.polygonOutput.value}` : '&polygon_geojson=1';
    return url;
  }

  private sendRequest(url: string): Observable<GeocodingResult[]> {
    return this.http.get<GeocodingResult[]>(url, {responseType: 'json'});
  }
}
