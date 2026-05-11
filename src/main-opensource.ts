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

import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AbstractArlasMapService, ArlasMapFrameworkService, BasemapService, LegendService } from 'arlas-map';
import { ArlasMaplibreService, ArlasMapService, MaplibreBasemapService, MaplibreLegendService } from 'arlas-maplibre';
import { ArlasWuiComponent } from './app/app.component';
import { ArlasWuiOSModule } from './app/app.module.opensource';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(ArlasWuiComponent, {
    providers: [
        importProvidersFrom(ArlasWuiOSModule),
        {
            provide: AbstractArlasMapService,
            useClass: ArlasMapService
        },
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
        provideZoneChangeDetection()
    ]
})
  .catch(err => console.log(err));
