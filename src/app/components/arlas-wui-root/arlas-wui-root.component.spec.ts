import { APP_BASE_HREF } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService, ArlasTaggerModule, ArlasToolKitModule, ArlasToolkitSharedModule
} from 'arlas-wui-toolkit';
import { LeftMenuComponent } from '../left-menu/left-menu.component';

import { HistogramModule, MapglImportModule, MapglModule, MapglSettingsModule } from 'arlas-web-components';
import { ArlasWuiRootComponent } from './arlas-wui-root.component';
import { ContributorService } from 'app/services/contributors.service';

describe('ArlasWuiRootComponent', () => {
  let component: ArlasWuiRootComponent;
  let fixture: ComponentFixture<ArlasWuiRootComponent>;
  let arlasStartupService: ArlasStartupService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, HistogramModule,
        MatSelectModule, MatMenuModule, MatProgressBarModule, MatRadioModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        MapglModule,
        ArlasTaggerModule, MapglImportModule, MapglSettingsModule, ArlasToolkitSharedModule,
      ],
      declarations: [
        ArlasWuiRootComponent, LeftMenuComponent
      ],
      providers: [
        ArlasCollaborativesearchService,
        ArlasConfigService,
        ContributorService,
        ArlasStartupService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    }).compileComponents();

  }));

  beforeEach(async(() => {
    arlasStartupService = TestBed.get(ArlasStartupService);
    arlasStartupService.arlasIsUp.subscribe(isUp => {
      if (isUp) {
        fixture = TestBed.createComponent(ArlasWuiRootComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }
    });
  }));
});
