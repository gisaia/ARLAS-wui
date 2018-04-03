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

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ContributorService } from './services/contributors.service';
import { MapglComponent, HistogramModule } from 'arlas-web-components';
import { SearchComponent } from 'app/components/search/search.component';
import { FiltersChipsComponent } from 'app/components/filters-chips/filters-chips.component';
import {
  MatIconModule, MatAutocompleteModule, MatInputModule,
  MatChipsModule, MatTooltipModule, MatSelectModule, MatMenuModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { routing } from './app.routes';
import { APP_BASE_HREF } from '@angular/common';
import { By } from '@angular/platform-browser';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { MarkdownModule } from 'angular2-markdown';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, HttpModule, RouterModule, routing, HistogramModule,
        MatSelectModule, MarkdownModule, MatMenuModule
      ],
      declarations: [
        AppComponent,
        MapglComponent, SearchComponent, FiltersChipsComponent, AboutComponent, AboutDialogComponent
      ],
      providers: [
        ArlasCollaborativesearchService,
        ArlasConfigService,
        ContributorService,
        ArlasStartupService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
