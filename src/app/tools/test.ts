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

import { vi } from 'vitest';

export class MockArlasConfigService {

  public getValue(key: string): any {
    if (key === 'arlas') {
      return {
        'web': {
          'contributors': []
        }
      };
    }
    if (key === 'arlas.web.contributors') {
      return [];
    }
    if (key === 'arlas.web.externalNode') {
      return {};
    }
    if(key === 'arlas-wui.web.app.units'){
      return [];
    }
    if (key === 'arlas.web.components.mapgl.input') {
      return {
        basemapStyles: [],
        mapLayers: {
          layers: [],
          externalEventLayers: [],
          events: {
            onHover: new Set(),
            emitOnClick: new Set(),
            zoomOnClick: new Set()
          }
        }
      };
    }
  }

  public getConfig() {
    return {};
  }
}

export class MockArlasStartupService {
  public shouldRunApp = true;
  public emptyMode = false;
  public contributorRegistry = new Map();
  public collectionsMap = new Map();
}

export const mockArlasSettingsService = {
  getDrawTheme: vi.fn(),
  getGeocodingSettings: vi.fn(),
  getAuthentSettings: vi.fn(),
  getPersistenceSettings: vi.fn(),
  getPermissionSettings: vi.fn(),
  getSettings: vi.fn(() => ({ tab_name: 'ARLAS-wui' })),
  getLinksSettings: vi.fn(),
  getTicketingKey: vi.fn()
};
