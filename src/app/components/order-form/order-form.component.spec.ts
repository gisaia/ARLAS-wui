import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderFormComponent } from './order-form.component';

describe('OrderFormComponent', () => {
    let component: OrderFormComponent;
    let fixture: ComponentFixture<OrderFormComponent>;

    beforeEach(async () => {
        const mockDialogRef = {
            close: vi.fn()
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
                    useValue: {}
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(OrderFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
