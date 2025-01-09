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

import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GetResultlistConfigPipe } from 'app/pipes/get-resultlist-config.pipe';
import { ContributorService } from 'app/services/contributors.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { VisualizeService } from 'app/services/visualize.service';
import { HistogramModule } from 'arlas-web-components';
import {
  ArlasCollaborativesearchService, ArlasCollectionService, ArlasConfigService, ArlasSettingsService,
  ArlasStartupService, ArlasTaggerModule, ArlasToolKitModule, ArlasToolkitSharedModule
} from 'arlas-wui-toolkit';
import { ArlasWuiRootComponent } from './arlas-wui-root.component';

describe('ArlasWuiRootComponent', () => {
  let component: ArlasWuiRootComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasWuiRootComponent<any, any, any>>;

  beforeEach(async () => {
    const mockSettingsService = jasmine.createSpyObj('ArlasSettingsService',
      ['settings', 'getAuthentSettings', 'getPersistenceSettings', 'getPermissionSettings', 'getSettings', 'getArlasHubUrl', 'setSettings',
        'getLinksSettings', 'getTicketingKey']);
    mockSettingsService.settings = { tab_name: 'Test' };
    mockSettingsService.getAuthentSettings.and.returnValue();
    mockSettingsService.getPersistenceSettings.and.returnValue();
    mockSettingsService.getPermissionSettings.and.returnValue();
    mockSettingsService.getSettings.and.returnValue();
    mockSettingsService.getArlasHubUrl.and.returnValue();
    mockSettingsService.setSettings.and.returnValue();
    mockSettingsService.getLinksSettings.and.returnValue();
    mockSettingsService.getTicketingKey.and.returnValue();

    const mockContributorService = jasmine.createSpyObj('ContributorService', ['getSearchContributors']);
    mockContributorService.getSearchContributors.and.returnValue();

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, HistogramModule,
        MatSelectModule, MatMenuModule, MatProgressBarModule, MatRadioModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        ArlasTaggerModule, ArlasToolkitSharedModule,
      ],
      declarations: [
        ArlasWuiRootComponent,
        GetResultlistConfigPipe
      ],
      providers: [
        ArlasCollaborativesearchService,
        ArlasConfigService,
        {
          provide: ContributorService,
          useValue: mockContributorService
        },
        ArlasStartupService,
        { provide: APP_BASE_HREF, useValue: '/' },
        ResultlistService,
        VisualizeService,
        {
          provide: ArlasSettingsService,
          useValue: mockSettingsService
        },
        ArlasCollectionService
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(ArlasWuiRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
