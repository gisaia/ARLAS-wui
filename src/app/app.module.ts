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

import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ARLAS_DATE_TIME_FORMATS,
  ArlasCollectionService,
  ArlasConfigService,
  ArlasIamService,
  ArlasSettingsService,
  ArlasTaggerModule,
  ArlasToolKitModule,
  ArlasToolkitSharedModule,
  ArlasWalkthroughModule,
  AuthentificationService,
  DEFAULT_OWL_DATE_TIME_FORMATS_VALUE,
  JwtInterceptor,
  PersistenceService,
  WalkthroughLoader,
  ARLAS_OWL_MOMENT_ADAPTER_OPTIONS_OVERRIDE
} from 'arlas-wui-toolkit';
import { LAZYLOAD_IMAGE_HOOKS } from 'ng-lazyload-image';
import { AppRoutingModule } from './app-routing.module';
import { ArlasWuiComponent } from './app.component';
import { ArlasAnalyticsComponent } from './components/arlas-analytics/arlas-analytics.component';
import { ArlasListComponent } from './components/arlas-list/arlas-list.component';
import { ArlasWuiMapComponent } from './components/arlas-map/arlas-map.component';
import { ArlasWuiRootComponent } from './components/arlas-wui-root/arlas-wui-root.component';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';
import { GeocodingComponent } from './components/geocoding/geocoding.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { RastersManagerComponent } from './components/map/raster-layers-manager/rasters-manager.component';
import { CogService } from './services/cog.service';
import { ContributorService } from './services/contributors.service';
import { ArlasWuiMapService } from './services/map.service';
import { ResultlistService } from './services/resultlist.service';
import { VisualizeService } from './services/visualize.service';
import { ArlasTranslateLoader, ArlasWalkthroughLoader } from './tools/customLoader';
import { LazyLoadImageHooks } from './tools/lazy-loader';
import { OwlDateTimeFormats } from '@danielmoncada/angular-datetime-picker';
import { OwlMomentDateTimeAdapterOptions } from '@danielmoncada/angular-datetime-picker-moment-adapter';


export const MY_CUSTOM_FORMATS_FR = {
  parseInput: 'DD MMM YYYY HH:mm:ss',
  fullPickerInput: 'DD MMM yyyy HH:mm:ss',
  datePickerInput: 'DD MMM YYYY HH:mm:ss',
  timePickerInput: 'HH:mm:ss',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
};

export const MY_CUSTOM_FORMATS_EN = {
  parseInput: 'MMM DD YYYY HH:mm:ss',
  fullPickerInput: 'MMM DD YYYY HH:mm:ss',
  datePickerInput: 'MMM DD YYYY HH:mm:ss',
  timePickerInput: 'HH:mm:ss',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
};

export function getOwlDateFormatFactory(configService: ArlasConfigService): OwlDateTimeFormats {
  const format = (configService.getConfig() as any)?.arlas?.web?.components?.timeline?.input?.ticksDateFormat;
  // '%d %b %Y  %H:%M' and '%b %d %Y  %H:%M' are the two formats available in the builder, the first for FR the second for ENG
  if (format === '%d %b %Y  %H:%M') {
    return MY_CUSTOM_FORMATS_FR;
  } else if (format === '%b %d %Y  %H:%M') {
    return MY_CUSTOM_FORMATS_EN;
  } else {
    return DEFAULT_OWL_DATE_TIME_FORMATS_VALUE;
  }
}

export function getOwlMomentAdapterFactory(configService: ArlasConfigService): Partial<OwlMomentDateTimeAdapterOptions> {
  const useUtc = (configService.getConfig() as any)?.arlas?.web?.contributors?.find((c: any) => c.name === 'Timeline')?.useUtc;
  if (!!useUtc) {
    return { useUtc };
  } else {
    return { useUtc: false };
  }
}

const COMPONENTS = [
  ArlasWuiComponent,
  ArlasWuiRootComponent,
  LeftMenuComponent,
  ConfigsListComponent,
  GeocodingComponent,
  RastersManagerComponent,
  ArlasWuiMapComponent,
  ArlasListComponent,
  ArlasAnalyticsComponent
];

@NgModule({
  exports: COMPONENTS,
  imports: [
    RouterModule,
    AppRoutingModule,
    ArlasToolkitSharedModule,
    ArlasToolKitModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: ArlasTranslateLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService, ArlasConfigService]
      }
    }),
    ArlasWalkthroughModule.forRoot({
      loader: {
        provide: WalkthroughLoader,
        useClass: ArlasWalkthroughLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService, ArlasConfigService, TranslateService]
      }
    }),
    ArlasTaggerModule,
    ...COMPONENTS
  ],
  providers: [
    VisualizeService,
    ArlasWuiMapService,
    ResultlistService,
    {
      provide: LAZYLOAD_IMAGE_HOOKS,
      useClass: LazyLoadImageHooks
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      deps: [AuthentificationService, ArlasIamService, ArlasSettingsService],
      multi: true
    },
    {
      provide: ARLAS_DATE_TIME_FORMATS,
      useFactory: getOwlDateFormatFactory,
      deps: [ArlasConfigService]
    },
    {
      provide: ARLAS_OWL_MOMENT_ADAPTER_OPTIONS_OVERRIDE,
      useFactory: getOwlMomentAdapterFactory,
      deps: [ArlasConfigService]
    },
    ArlasCollectionService,
    ContributorService,
    CogService
  ]
})
export class ArlasWuiModule {
}
