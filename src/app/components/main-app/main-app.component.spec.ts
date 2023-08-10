import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAppComponent } from './main-app.component';
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
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { routing } from 'app/app.routes';
import { ArlasToolKitModule, ArlasTaggerModule, ArlasToolkitSharedModule,
  ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { ArlasWuiComponent, ContributorService } from 'public-api';
import { AboutComponent, AboutDialogComponent } from '../about/about.component';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { CrossMapService } from 'app/services/cross-tabs-communication/cross.map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { MapService } from 'app/services/map.service';
import { VisualizeService } from 'app/services/visualize.service';
import { SidenavService } from 'app/services/sidenav.service';
import { CrossCollaborationsService } from 'app/services/cross-tabs-communication/cross.collaboration.service';
import { CrossResultlistService } from 'app/services/cross-tabs-communication/cross.resultlist.service';
import { DynamicComponentService } from 'app/services/dynamicComponent.service';

describe('MainAppComponent', () => {
  let component: MainAppComponent;
  let fixture: ComponentFixture<MainAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule, ArlasToolKitModule,
        FormsModule, MatChipsModule, MatTooltipModule, RouterModule, routing,
        MatSelectModule, MatMenuModule, MatProgressBarModule, MatRadioModule,
        ArlasTaggerModule, ArlasToolkitSharedModule
      ],
      declarations: [
        ArlasWuiComponent, LeftMenuComponent, AboutComponent, AboutDialogComponent
      ],
      providers: [
        VisualizeService, SidenavService, CrossCollaborationsService,
        ResultlistService, MapService, CrossMapService, CrossResultlistService,
        ArlasCollaborativesearchService, DynamicComponentService,
        ArlasConfigService,
        ContributorService,
        ArlasStartupService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
