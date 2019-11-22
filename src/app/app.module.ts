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
  MatTooltipModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxMdModule } from 'ngx-md';
import { HistogramModule, MapglModule, GaugeModule, MapglImportModule, MapglSettingsModule } from 'arlas-web-components';
import { ArlasToolKitModule, ArlasTaggerModule } from 'arlas-wui-toolkit';
import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { MenuComponent } from './components/menu/menu.component';

import { ContributorService } from './services/contributors.service';

@NgModule({
  declarations: [
    AboutComponent,
    AboutDialogComponent,
    AppComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    GaugeModule,
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
    HistogramModule,
    RouterModule,
    routing,
    ArlasToolKitModule,
    ArlasTaggerModule
  ],
  providers: [
    ContributorService
  ],
  bootstrap: [AppComponent],
  entryComponents: [AboutDialogComponent]
})
export class AppModule { }
