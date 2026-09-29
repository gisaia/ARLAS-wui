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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpentelemetryService } from '../../services/opentelemetry.service';
import { OrderFormComponent } from './order-form.component';

describe('OrderFormComponent', () => {
    let component: OrderFormComponent;
    let fixture: ComponentFixture<OrderFormComponent>;
    let mockOpentelemetryService: { sendCustomMessage: ReturnType<typeof vi.fn>; };
    let mockDialogRef: { close: ReturnType<typeof vi.fn>; };

    beforeEach(async () => {
        mockDialogRef = {
            close: vi.fn()
        };
        mockOpentelemetryService = {
            sendCustomMessage: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [
                OrderFormComponent,
                OAuthModule.forRoot(),
                TranslateModule.forRoot()
            ],
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { aoi: [] }
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                },
                {
                    provide: OpentelemetryService,
                    useValue: mockOpentelemetryService
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(OrderFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create and record form_started telemetry', () => {
        expect(component).toBeTruthy();
        expect(mockOpentelemetryService.sendCustomMessage).toHaveBeenCalledWith(
            'form_started',
            expect.objectContaining({ form_id: 'order_form', process_id: 'download', aoi_count: 0 })
        );
    });

    it('should record funnel_abandoned telemetry on cancel if not submitted', () => {
        component.cancel();
        expect(mockOpentelemetryService.sendCustomMessage).toHaveBeenCalledWith(
            'funnel_abandoned',
            expect.objectContaining({ funnel_name: 'order_process', step: 'configuration' })
        );
        expect(mockDialogRef.close).toHaveBeenCalled();
    });
});

