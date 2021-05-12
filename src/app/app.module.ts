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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatTableModule,
  MatTooltipModule,
  MatListModule,
  MatSidenavModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxMdModule } from 'ngx-md';
import { HistogramModule, MapglModule, MapglImportModule, MapglSettingsModule } from 'arlas-web-components';
import { ArlasToolKitModule, ArlasTaggerModule, ArlasToolkitSharedModule, ArlasWalkthroughModule } from 'arlas-wui-toolkit';
import { ArlasWuiComponent } from './app.component';
import { routing } from 'arlas-wui-toolkit/app.routes';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ContributorService } from './services/contributors.service';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { SidenavService } from './services/sidenav.service';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { ArlasTranslateLoader, ArlasWalkthrougLoader } from './tools/customLoader';
import { WalkthrougLoader } from 'arlas-wui-toolkit/services/walkthrough/walkthrough.utils';


@NgModule({
  declarations: [
    AboutComponent,
    AboutDialogComponent,
    ArlasWuiComponent,
    LeftMenuComponent,
    ConfigsListComponent


  ],
  exports: [
    AboutComponent,
    AboutDialogComponent,
    ArlasWuiComponent,
    LeftMenuComponent,
    ConfigsListComponent
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
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgxMdModule,
    FormsModule,
    ReactiveFormsModule,
    MapglModule,
    MatTableModule,
    MatListModule,
    MatSidenavModule,
    HistogramModule,
    routing,
    ArlasToolkitSharedModule,
    ArlasToolKitModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: ArlasTranslateLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService]
      }
    }),
    ArlasWalkthroughModule.forRoot({
      loader: {
        provide: WalkthrougLoader,
        useClass: ArlasWalkthrougLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService, TranslateService]
      }
    }),
    ArlasTaggerModule
  ],
  providers: [
    ContributorService,
    SidenavService

  ],
  bootstrap: [ArlasWuiComponent],
  entryComponents: [AboutDialogComponent]
})
export class ArlasWuiModule { }
