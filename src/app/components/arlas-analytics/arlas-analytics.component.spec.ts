import { Dialog, DIALOG_SCROLL_STRATEGY } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasCollaborativesearchService, ArlasCollectionService, ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../services/contributors.service';
import { VisualizeService } from '../../services/visualize.service';
import { MockArlasStartupService } from '../../tools/test';
import { ArlasAnalyticsComponent } from './arlas-analytics.component';

describe('ArlasAnalyticsComponent', () => {
  let component: ArlasAnalyticsComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasAnalyticsComponent<any, any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [
            TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
            ArlasAnalyticsComponent,
            RouterModule.forRoot([])
        ],
        providers: [
            ArlasCollaborativesearchService,
            {
                provide: ArlasStartupService,
                useClass: MockArlasStartupService
            },
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
            Overlay,
            ArlasCollectionService,
            ContributorService,
            provideHttpClient(withInterceptorsFromDi())
        ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArlasAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
