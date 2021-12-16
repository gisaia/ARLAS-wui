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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { } from '@angular/material';
import { } from '@angular/material';
import { } from '@angular/material';
import { } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HistogramModule, MapglModule, MapglImportModule, MapglSettingsModule, ResultsModule } from 'arlas-web-components';
import { ArlasToolKitModule, ArlasTaggerModule, ArlasToolkitSharedModule, ArlasWalkthroughModule, ArlasSettingsService } from 'arlas-wui-toolkit';
import { ArlasWuiComponent } from './app.component';

import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { HttpClient } from '@angular/common/http';
import { ContributorService } from './services/contributors.service';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { SidenavService } from './services/sidenav.service';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';


import { ArlasTranslateLoader, ArlasWalkthroughLoader } from './tools/customLoader';

import { DynamicComponentService } from './services/dynamicComponent.service';

import { VisualizeService } from './services/visualize.service';
import { ToolkitRoutingModule } from 'arlas-wui-toolkit/lib/toolkit-routing.module';
import { PersistenceService } from 'arlas-wui-toolkit/lib/services/persistence/persistence.service';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { WalkthroughLoader } from 'arlas-wui-toolkit/lib/services/walkthrough/walkthrough.utils';
import { MarkdownModule } from 'ngx-markdown';



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
    MatSnackBarModule,
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
    MatSidenavModule,
    HistogramModule,
    ToolkitRoutingModule,
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
        provide: WalkthroughLoader,
        useClass: ArlasWalkthroughLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService, TranslateService]
      }
    }),
    ArlasTaggerModule
  ],
  providers: [
    ContributorService,
    SidenavService,
    DynamicComponentService,
    VisualizeService

  ],
  bootstrap: [ArlasWuiComponent],
  entryComponents: [AboutDialogComponent]
})
export class ArlasWuiModule { }
