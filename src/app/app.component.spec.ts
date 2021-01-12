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
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatChipsModule, MatIconModule,
  MatInputModule, MatMenuModule, MatSelectModule,
  MatTooltipModule, MatProgressBarModule, MatRadioModule
} from '@angular/material';
import { RouterModule } from '@angular/router';

import { NgxMdModule } from 'ngx-md';
import { HistogramModule, MapglModule, MapglImportModule, MapglSettingsModule } from 'arlas-web-components';
import { ArlasToolKitModule, ArlasTaggerModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';

import { ArlasWuiComponent } from './app.component';
import { routing } from './app.routes';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { ContributorService } from './services/contributors.service';
import { TranslateService, TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';

describe('AppComponent', () => {
  let component: ArlasWuiComponent;
  let fixture: ComponentFixture<ArlasWuiComponent>;
  let arlasStartupService: ArlasStartupService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, routing, HistogramModule,
        MatSelectModule, NgxMdModule, MatMenuModule, MatProgressBarModule, MatRadioModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        MapglModule,
        ArlasTaggerModule, MapglImportModule, MapglSettingsModule, ArlasToolkitSharedModule,
      ],
      declarations: [
        ArlasWuiComponent, LeftMenuComponent, AboutComponent, AboutDialogComponent
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

  beforeEach(async(() => {
    arlasStartupService = TestBed.get(ArlasStartupService);
    arlasStartupService.arlasIsUp.subscribe(isUp => {
      if (isUp) {
        fixture = TestBed.createComponent(ArlasWuiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }
    });
  }));
});
