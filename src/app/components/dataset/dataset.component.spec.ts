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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { MatChipsModule, MatDialogModule, MatIconModule, MatSnackBarModule, MatTooltipModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetComponent } from './dataset.component';
import { ArlasBookmarkService } from 'arlas-wui-toolkit/services/bookmark/bookmark.service';
import { ContributorService } from '../../services/contributors.service';
import { TranslateModule, TranslateService, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';

import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { BrowserModule } from '@angular/platform-browser';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ArlasToolKitModule, MatChipsModule, MatDialogModule, MatIconModule, RouterModule,
        BrowserModule, RouterTestingModule, MatSnackBarModule, HttpClientModule,
        MatTooltipModule, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })
      ],
      declarations: [DatasetComponent],
      providers: [
        ArlasConfigService,
        ArlasCollaborativesearchService,
        ArlasStartupService,
        ArlasBookmarkService,
        ContributorService,
        TranslateService,
        HttpClient,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    })
      .compileComponents();
  }));

  it('should create', (() => {
    const arlasStartupService = TestBed.get(ArlasStartupService);
    arlasStartupService.arlasIsUp.subscribe(isUp => {
      if (isUp) {
        fixture = TestBed.createComponent(DatasetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
      }
    });
  }));
});
