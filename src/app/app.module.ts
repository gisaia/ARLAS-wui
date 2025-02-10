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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArlasMapModule } from 'arlas-map';
import { FormatNumberModule, GetValueModule, HistogramModule, ResultsModule, } from 'arlas-web-components';
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
import { LAZYLOAD_IMAGE_HOOKS, LazyLoadImageModule } from 'ng-lazyload-image';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { ArlasWuiComponent } from './app.component';
import { ArlasAnalyticsComponent } from './components/arlas-analytics/arlas-analytics.component';
import { ArlasListComponent } from './components/arlas-list/arlas-list.component';
import { AoiDimensionComponent } from './components/arlas-map/aoi-dimensions/aoi-dimensions.component';
import { RoundKilometer, SquareKilometer } from './components/arlas-map/aoi-dimensions/aoi-dimensions.pipes';
import { ArlasWuiMapComponent } from './components/arlas-map/arlas-map.component';
import { ArlasWuiRootComponent } from './components/arlas-wui-root/arlas-wui-root.component';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';
import { GeocodingComponent } from './components/geocoding/geocoding.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { RastersManagerComponent } from './components/map/raster-layers-manager/rasters-manager.component';
import { GetResultlistConfigPipe } from './pipes/get-resultlist-config.pipe';
import { ContributorService } from './services/contributors.service';
import { ArlasWuiMapService } from './services/map.service';
import { ResultlistService } from './services/resultlist.service';
import { VisualizeService } from './services/visualize.service';
import { ArlasTranslateLoader, ArlasWalkthroughLoader } from './tools/customLoader';
import { LazyLoadImageHooks } from './tools/lazy-loader';
import {
  CogVisualisationManagerComponent
} from '@components/map/cog-visualisation-manager/cog-visualisation-manager.component';


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
    ArlasWuiMapComponent,
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
    ArlasWuiMapComponent,
    ArlasListComponent,
    GetResultlistConfigPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    GetValueModule,
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
    MatTableModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    FormatNumberModule,
    HistogramModule,
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
    ArlasMapModule,
    CogVisualisationManagerComponent
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
    ArlasCollectionService,
    ContributorService
  ],
  bootstrap: [ArlasWuiComponent]
})
export class ArlasWuiModule {
}
