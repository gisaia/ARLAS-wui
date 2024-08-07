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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  HistogramModule, MapglImportModule, MapglModule, MapglSettingsModule,
  ResultsModule, FormatNumberModule, BboxGeneratorModule, GetValueModule
} from 'arlas-web-components';
import {
  ArlasCollectionService,
  ArlasConfigService,
  ArlasIamService,
  ArlasSettingsService,
  ArlasTaggerModule,
  ArlasToolKitModule,
  ArlasToolkitSharedModule,
  ArlasWalkthroughModule,
  AuthentificationService,
  JwtInterceptor,
  LoginModule,
  PersistenceService,
  WalkthroughLoader
} from 'arlas-wui-toolkit';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { ArlasWuiComponent } from './app.component';
import { ArlasWuiRootComponent } from './components/arlas-wui-root/arlas-wui-root.component';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';
import { GeocodingComponent } from './components/geocoding/geocoding.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { AoiDimensionComponent } from './components/arlas-map/aoi-dimensions/aoi-dimensions.component';
import { RoundKilometer, SquareKilometer } from './components/arlas-map/aoi-dimensions/aoi-dimensions.pipes';
import { ContributorService } from './services/contributors.service';
import { VisualizeService } from './services/visualize.service';
import { ArlasTranslateLoader, ArlasWalkthroughLoader } from './tools/customLoader';
import { LazyLoadImageHooks } from './tools/lazy-loader';
import { LAZYLOAD_IMAGE_HOOKS, LazyLoadImageModule } from 'ng-lazyload-image';
import { RastersManagerComponent } from './components/map/raster-layers-manager/rasters-manager.component';
import { ArlasMapComponent } from './components/arlas-map/arlas-map.component';
import { ArlasListComponent } from './components/arlas-list/arlas-list.component';
import { GetResultlistConfigPipe } from './pipes/get-resultlist-config.pipe';
import { MapService } from './services/map.service';
import { ResultlistService } from './services/resultlist.service';
import { ArlasAnalyticsComponent } from './components/arlas-analytics/arlas-analytics.component';


@NgModule({
  declarations: [
    AoiDimensionComponent,
    ArlasWuiComponent,
    ArlasWuiRootComponent,
    LeftMenuComponent,
    ConfigsListComponent,
    RoundKilometer,
    SquareKilometer,
    GeocodingComponent,
    RastersManagerComponent,
    ArlasMapComponent,
    ArlasListComponent,
    GetResultlistConfigPipe,
    ArlasAnalyticsComponent
  ],
  exports: [
    AoiDimensionComponent,
    ArlasWuiComponent,
    ArlasWuiRootComponent,
    LeftMenuComponent,
    ConfigsListComponent,
    RoundKilometer,
    SquareKilometer,
    GeocodingComponent,
    ArlasMapComponent,
    ArlasListComponent,
    GetResultlistConfigPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MapglImportModule,
    MapglSettingsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
    MarkdownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ResultsModule,
    MapglModule,
    MatTableModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    FormatNumberModule,
    HistogramModule,
    BboxGeneratorModule,
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
    LoginModule,
    LazyLoadImageModule,
    GetValueModule
  ],
  providers: [
    VisualizeService,
    MapService,
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
    ArlasCollectionService,
    ContributorService
  ],
  bootstrap: [ArlasWuiComponent],
  entryComponents: []
})
export class ArlasWuiModule {
}
