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

import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatChipsModule, MatDialogModule, MatIconModule, MatMenuModule, MatTooltipModule } from '@angular/material';
import { NgxMdModule } from 'ngx-md';
import { ArlasToolKitModule, ArlasTaggerModule } from 'arlas-wui-toolkit';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { ContributorService } from '../../services/contributors.service';
import { AboutComponent, AboutDialogComponent } from '../about/about.component';
import { MenuComponent } from './menu.component';
import { TranslateService, TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ArlasWalkthroughService } from 'arlas-wui-toolkit/services/walkthrough/walkthrough.service';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ArlasToolKitModule, MatChipsModule, MatIconModule, MatTooltipModule, MatMenuModule, MatDialogModule,
        NgxMdModule, HttpClientModule, ArlasTaggerModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })],
      declarations: [MenuComponent, AboutComponent, AboutDialogComponent],
      providers: [
        ArlasConfigService, ArlasCollaborativesearchService,
        ContributorService, HttpClient, TranslateService, ArlasWalkthroughService
      ]
    }).compileComponents();

  });

  beforeEach( () => {
      fixture = TestBed.createComponent(MenuComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', (() => {
      expect(component).toBeTruthy();
  }));
});
