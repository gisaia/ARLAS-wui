import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { BasemapService } from 'arlas-map';
import { ArlasCollectionService, ArlasConfigService, ArlasMapService, ArlasMapSettings, ArlasStartupService } from 'arlas-wui-toolkit';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../services/contributors.service';
import { VisualizeService } from '../../services/visualize.service';
import { MockArlasConfigService, MockArlasStartupService } from '../../tools/test';
import { ArlasWuiMapComponent } from './arlas-map.component';

describe('ArlasWuiMapComponent', () => {
  let component: ArlasWuiMapComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasWuiMapComponent<any, any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        }),
        ArlasWuiMapComponent,
        RouterModule.forRoot([]),
        OAuthModule.forRoot()
      ],
      providers: [
        VisualizeService,
        ContributorService,
        ArlasMapService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        ArlasMapSettings,
        ArlasCollectionService,
        {
          provide: ArlasConfigService,
          useClass: MockArlasConfigService
        },
        {
          provide: BasemapService,
          useValue: {
            fetchSources$: () => of([]),
            protomapBasemapAdded$: of(),
            setBasemaps: (basemaps) => { },
            basemapChanged$: of()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArlasWuiMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
