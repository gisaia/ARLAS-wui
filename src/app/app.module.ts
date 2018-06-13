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

import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

import { HistogramModule, MapglModule } from 'arlas-web-components';

import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatChipsModule,
  MatIconModule,
  MatTooltipModule,
  MatProgressBarModule,
  MatMenuModule,
  MatTableModule
} from '@angular/material';

import { ContributorService } from './services/contributors.service';
import { ConfigService } from 'arlas-web-core';

import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';
import { FiltersChipsComponent } from './components/filters-chips/filters-chips.component';
import { routing } from './app.routes';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';
import { MarkdownModule } from 'angular2-markdown';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { DatasetComponent, DatasetDialogComponent } from './components/dataset/dataset.component';

@NgModule({
  declarations: [
    AboutComponent,
    AboutDialogComponent,
    AppComponent,
    SearchComponent,
    FiltersChipsComponent,
    DatasetComponent,
    DatasetDialogComponent
  ],
  imports: [
    BrowserModule,
    TagInputModule,
    BrowserAnimationsModule,
    HttpModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MarkdownModule,
    FormsModule,
    ReactiveFormsModule,
    MapglModule,
    MatTableModule,
    HistogramModule,
    RouterModule,
    routing,
    ArlasToolKitModule
  ],
  providers: [
    ContributorService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ AboutDialogComponent, DatasetDialogComponent]
})
export class AppModule { }
