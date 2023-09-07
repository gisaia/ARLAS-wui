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

import { ResultListSort } from 'app/tools/utils';
import { BasemapStyle, ModeEnum } from 'arlas-web-components';

export class ResultListSettings {
  public constructor(
    public open: boolean,
    public mode: ModeEnum,
    public sort?: ResultListSort,
    /** Name of the tab selected if open */
    public tab?: string
  ) {}
}

export class LegendSettings {
  public constructor(
    public open: boolean,
    /** Dictionnary of the visible layers legend (value) among the visible visualisation sets (key) */
    public visibleLayers: Record<string, Array<string>>
    // QUESTION: Should we remember the legend state if we close the whole legend, a vis set, ...
  ) {}
}

export class AnalyticsSettings {
  public constructor(
    public open: boolean,
    /** Name of the tab selected if open */
    public at?: string
  ) {}
}

export class TimelineSettings {
  public constructor(
    public open: boolean
  ) {}
}

export class MapSettings {
  public constructor(
    public extent: string,
    public basemap: BasemapStyle
  ) {}
}

export class UserPreferencesSettings {
  public constructor(
    public analytics: AnalyticsSettings,
    public legend: LegendSettings,
    public list: ResultListSettings,
    public map: MapSettings,
    public timeline: TimelineSettings
  ) {}
}
