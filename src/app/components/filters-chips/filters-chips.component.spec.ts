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
import { HttpModule } from '@angular/http';
import { MatChipsModule, MatDialogModule, MatIconModule, MatMenuModule, MatTooltipModule } from '@angular/material';
import { MarkdownModule } from 'angular2-markdown';
import { ShareComponent } from 'arlas-wui-toolkit/components/share/share.component';
import { TagComponent } from 'arlas-wui-toolkit/components/tag/tag.component';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { ContributorService } from '../../services/contributors.service';
import { AboutComponent, AboutDialogComponent } from '../about/about.component';
import { FiltersChipsComponent } from './filters-chips.component';


describe('FiltersChipsComponent', () => {
  let component: FiltersChipsComponent;
  let fixture: ComponentFixture<FiltersChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, MatIconModule, MatTooltipModule, HttpModule, MatMenuModule, MatDialogModule, MarkdownModule],
      declarations: [FiltersChipsComponent, AboutComponent, AboutDialogComponent, ShareComponent, TagComponent],
      providers: [ArlasConfigService, ArlasCollaborativesearchService, ContributorService, ArlasStartupService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
