import { APP_BASE_HREF } from '@angular/common';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatChipsModule, MatIconModule,
  MatInputModule, MatMenuModule, MatSelectModule,
  MatTooltipModule, MatProgressBarModule, MatRadioModule
} from '@angular/material';
import { RouterModule } from '@angular/router';

import { NgxMdModule } from 'ngx-md';
import { MenuComponent } from 'app/components/menu/menu.component';
import { HistogramModule, MapglComponent, GaugeModule, MapglImportModule } from 'arlas-web-components';
import { ArlasToolKitModule, ArlasTaggerModule } from 'arlas-wui-toolkit';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';

import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { ContributorService } from './services/contributors.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, routing, HistogramModule,
        MatSelectModule, NgxMdModule, MatMenuModule, MatProgressBarModule, MatRadioModule, GaugeModule,
        ArlasTaggerModule, MapglImportModule
      ],
      declarations: [
        AppComponent, MapglComponent, MenuComponent, AboutComponent, AboutDialogComponent
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
    const arlasStartupService = TestBed.get(ArlasStartupService);
    arlasStartupService.arlasIsUp.subscribe(isUp => {
      if (isUp) {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
      }
    });
  }));
});
