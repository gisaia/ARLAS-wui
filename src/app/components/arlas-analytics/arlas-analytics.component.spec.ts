import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasAnalyticsComponent } from './arlas-analytics.component';
import { APP_BASE_HREF } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { routing } from 'app/app.routes';
import { ArlasToolKitModule, ArlasTaggerModule, ArlasToolkitSharedModule, ArlasCollaborativesearchService,
  ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { ArlasWuiComponent, ContributorService } from 'public-api';
import { AboutComponent, AboutDialogComponent } from '../about/about.component';
import { LeftMenuComponent } from '../left-menu/left-menu.component';

describe('ArlasAnalyticsComponent', () => {
  let component: ArlasAnalyticsComponent;
  let fixture: ComponentFixture<ArlasAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, routing,
        MatSelectModule, MatMenuModule, MatProgressBarModule, MatRadioModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        ArlasTaggerModule, ArlasToolkitSharedModule,
      ],
      declarations: [
        ArlasWuiComponent, LeftMenuComponent, AboutComponent, AboutDialogComponent
      ],
      providers: [
        ArlasCollaborativesearchService,
        ArlasConfigService,
        ContributorService,
        ArlasStartupService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArlasAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
