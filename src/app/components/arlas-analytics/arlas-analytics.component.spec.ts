import { Dialog, DIALOG_SCROLL_STRATEGY } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { VisualizeService } from '@services/visualize.service';
import { ArlasCollaborativesearchService, ArlasStartupService } from 'arlas-wui-toolkit';
import { ArlasAnalyticsComponent } from './arlas-analytics.component';

describe('ArlasAnalyticsComponent', () => {
  let component: ArlasAnalyticsComponent;
  let fixture: ComponentFixture<ArlasAnalyticsComponent>;

  beforeEach(async () => {
    const mockArlasStartupService = jasmine.createSpyObj('ArlasStartupService', [], {
      shouldRunApp: true,
      emptyMode: false,
      contributorRegistry: new Map()
    });

    await TestBed.configureTestingModule({
      declarations: [ ArlasAnalyticsComponent ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })
      ],
      providers: [
        ArlasCollaborativesearchService,
        {
          provide: ArlasStartupService,
          useValue: mockArlasStartupService
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
        Overlay
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
