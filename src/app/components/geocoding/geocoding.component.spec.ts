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

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpentelemetryService } from '../../services/opentelemetry.service';
import { GeocodingComponent } from './geocoding.component';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;
  let mockOpentelemetryService: { sendCustomMessage: ReturnType<typeof vi.fn>; };

  beforeEach(async () => {
    mockOpentelemetryService = {
      sendCustomMessage: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
        GeocodingComponent
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: OpentelemetryService,
          useValue: mockOpentelemetryService
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send telemetry when an address is selected', () => {
    component.onSearchLocation({ display_name: 'Paris, France' } as any);
    expect(mockOpentelemetryService.sendCustomMessage).toHaveBeenCalledWith(
      'core_feature_used',
      expect.objectContaining({ feature: 'geocoding_result_selected', address: 'Paris, France' })
    );
  });
});
