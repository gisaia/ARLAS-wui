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

import { Dialog, DIALOG_SCROLL_STRATEGY } from '@angular/cdk/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasColorService, ColorGeneratorLoader } from 'arlas-web-components';
import {
  ArlasCollaborativesearchService, ArlasCollectionService,
  ArlasConfigService, ArlasSettingsService, ArlasStartupService
} from 'arlas-wui-toolkit';
import { of } from 'rxjs';
import { ArlasWuiComponent } from './app.component';
import { ContributorService } from './services/contributors.service';
import { ArlasWuiMapService } from './services/map.service';
import { ResultlistService } from './services/resultlist.service';
import { VisualizeService } from './services/visualize.service';
import { MockArlasConfigService, MockArlasStartupService } from './tools/test';

describe('ArlasWuiComponent', () => {
  let component: ArlasWuiComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasWuiComponent<any, any, any>>;

  beforeEach(async () => {
    const mockSettingsService = jasmine.createSpyObj('ArlasSettingsService', ['getHistogramMaxBucket', 'getProcessSettings']);
    mockSettingsService.getHistogramMaxBucket.and.returnValue();
    mockSettingsService.getProcessSettings.and.returnValue({});

    const mockContributorService = jasmine.createSpyObj('ContributorService', ['getMapContributors']);
    mockContributorService.getMapContributors.and.returnValue([]);

    const mockColorGeneratorLoader = jasmine.createSpyObj('ColorGeneratorLoader', [], {
      changekeysToColors$: of()
    });

    await TestBed.configureTestingModule({
      declarations: [ArlasWuiComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatTooltipModule,
        /** Needed for ResultlistService */
        RouterTestingModule,
        HttpClientModule
        /** End */
      ],
      providers: [
        ResultlistService,
        ArlasWuiMapService,
        ArlasColorService,
        ArlasCollaborativesearchService,
        ArlasConfigService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        {
          provide: ArlasSettingsService,
          useValue: mockSettingsService
        },
        {
          provide: ContributorService,
          useValue: mockContributorService
        },
        /** Needed for ResultlistService */
        MatSnackBar,
        VisualizeService,
        MatDialog,
        {
          provide: MAT_DIALOG_SCROLL_STRATEGY,
          useValue: {}
        },
        Dialog,
        {
          provide: DIALOG_SCROLL_STRATEGY,
          useValue: {}
        },
        /** End */
        {
          provide: ColorGeneratorLoader,
          useValue: mockColorGeneratorLoader
        },
        ArlasCollectionService,
        {
          provide: ArlasConfigService,
          useClass: MockArlasConfigService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArlasWuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
