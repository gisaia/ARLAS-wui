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

import { NgModule } from '@angular/core';
import { ArlasWuiComponent } from './app.component';
import { ArlasMapFrameworkService, AbstractArlasMapService, BasemapService, LegendService } from 'arlas-map';
import { ArlasMaplibreService, MaplibreBasemapService, MaplibreLegendService, ArlasMapService } from 'arlas-maplibre';
import { ArlasWuiModule } from './app.module';


@NgModule({
  imports: [
    ArlasWuiModule
  ],
  providers: [
    {
      provide: AbstractArlasMapService,
      useClass: ArlasMapService
    },
    ArlasMaplibreService,
    {
      provide: BasemapService,
      useClass: MaplibreBasemapService
    },
    {
      provide: LegendService,
      useClass: MaplibreLegendService
    },
    {
      provide: ArlasMapFrameworkService,
      useClass: ArlasMaplibreService
    },
    ArlasMapService,
  ],
  bootstrap: [ArlasWuiComponent],
})
export class ArlasWuiOSModule {
}
