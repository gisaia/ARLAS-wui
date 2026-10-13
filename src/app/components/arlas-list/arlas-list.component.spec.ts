import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ArlasCollectionService, ArlasStartupService, CONFIG_UPDATER, FETCH_OPTIONS, GET_OPTIONS } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../services/contributors.service';
import { VisualizeService } from '../../services/visualize.service';
import { ArlasListComponent } from './arlas-list.component';

describe('ArlasListComponent', () => {
  let component: ArlasListComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasListComponent<any, any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        }),
        ArlasListComponent,
        RouterModule.forRoot([]),
        OAuthModule.forRoot()
      ],
      providers: [
        VisualizeService,
        ContributorService,
        ArlasCollectionService,
        ArlasStartupService,
        {
          provide: FETCH_OPTIONS,
          useValue: {}
        },
        {
          provide: GET_OPTIONS,
          useValue: () => {}
        },
        {
          provide: CONFIG_UPDATER,
          useValue: () => {}
        }
      ],
      teardown: { destroyAfterEach: false }
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArlasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
