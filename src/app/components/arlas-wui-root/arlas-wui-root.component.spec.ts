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
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ArlasBasemaps, BasemapService } from 'arlas-map';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import {
    ArlasBookmarkService,
    ArlasCollaborativesearchService, ArlasCollectionService, ArlasConfigService, ArlasMapService, ArlasMapSettings,
    ArlasSettingsService, ArlasStartupService, ArlasTagService, ArlasWalkthroughModule, CONFIG_UPDATER, FETCH_OPTIONS, GET_OPTIONS
} from 'arlas-wui-toolkit';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContributorService } from '../../services/contributors.service';
import { ResultlistService } from '../../services/resultlist.service';
import { VisualizeService } from '../../services/visualize.service';
import { MockArlasConfigService, mockArlasSettingsService } from '../../tools/test';
import { ArlasWuiRootComponent } from './arlas-wui-root.component';

describe('ArlasWuiRootComponent', () => {
    let component: ArlasWuiRootComponent<any, any, any>;
    let fixture: ComponentFixture<ArlasWuiRootComponent<any, any, any>>;

    beforeEach(async () => {
        const mockSettingsService = {
            settings: { tab_name: 'Test' },
            getAuthentSettings: vi.fn().mockName('ArlasSettingsService.getAuthentSettings'),
            getPersistenceSettings: vi.fn().mockName('ArlasSettingsService.getPersistenceSettings'),
            getPermissionSettings: vi.fn().mockName('ArlasSettingsService.getPermissionSettings'),
            getSettings: vi.fn().mockName('ArlasSettingsService.getSettings'),
            getArlasHubUrl: vi.fn().mockName('ArlasSettingsService.getArlasHubUrl'),
            setSettings: vi.fn().mockName('ArlasSettingsService.setSettings'),
            getLinksSettings: vi.fn().mockName('ArlasSettingsService.getLinksSettings'),
            getTicketingKey: vi.fn().mockName('ArlasSettingsService.getTicketingKey'),
            getGeocodingSettings: vi.fn()
        };

        const mockContributorService = {
            getSearchContributors: vi.fn().mockName('ContributorService.getSearchContributors')
        };

        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
                ArlasWuiRootComponent,
                RouterModule.forRoot([]),
                OAuthModule.forRoot(),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
                ArlasWalkthroughModule.forRoot(),
            ],
            providers: [
                ArlasCollaborativesearchService,
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
                ArlasCollectionService,
                {
                    provide: FETCH_OPTIONS,
                    useValue: {}
                },
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: CONFIG_UPDATER,
                    useValue: () => { }
                },
                ArlasMapSettings,
                ArlasMapService,
                ArlasBookmarkService,
                ArlasTagService,
                {
                    provide: ArlasConfigService,
                    useClass: MockArlasConfigService
                },
                {
                    provide: BasemapService,
                    useValue: {
                        fetchSources$: () => of([]),
                        protomapBasemapAdded$: of(),
                        setBasemaps: (basemaps: ArlasBasemaps) => { },
                        basemapChanged$: of()
                    }
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                }
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
