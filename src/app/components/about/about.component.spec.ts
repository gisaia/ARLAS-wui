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

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatInputModule, MatIconModule, MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMdModule } from 'ngx-md';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ArlasToolKitModule, ReactiveFormsModule, MatAutocompleteModule,
        MatInputModule, FormsModule, BrowserAnimationsModule,
        MatIconModule, NgxMdModule, MatDialogModule
      ],
      declarations: [AboutComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (() => {
    expect(component).toBeTruthy();
  }));
});
