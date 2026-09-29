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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpentelemetryService } from '../../services/opentelemetry.service';
import { ExportDataDialogComponent } from './export-data-dialog.component';

describe('ExportDataDialogComponent', () => {
  let component: ExportDataDialogComponent;
  let fixture: ComponentFixture<ExportDataDialogComponent>;
  let mockOpentelemetryService: { sendCustomMessage: ReturnType<typeof vi.fn>; };

  beforeEach(async () => {
    mockOpentelemetryService = {
      sendCustomMessage: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
        ExportDataDialogComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: OpentelemetryService,
          useValue: mockOpentelemetryService
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ExportDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and record form_started telemetry', () => {
    expect(component).toBeTruthy();
    expect(mockOpentelemetryService.sendCustomMessage).toHaveBeenCalledWith(
      'form_started',
      expect.objectContaining({ form_id: 'export_data_dialog', available_tabs: [] })
    );
  });

  it('should record tab change telemetry', () => {
    (component as any).componentsConf.set([{ key: 'download' }]);
    component.onTabChange(0);
    expect(mockOpentelemetryService.sendCustomMessage).toHaveBeenCalledWith(
      'cta_click',
      expect.objectContaining({ cta_id: 'export_dialog_tab_switch', tab_key: 'download' })
    );
  });
});
