import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasCollectionService, ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../../services/contributors.service';
import { VisualizeService } from '../../../services/visualize.service';
import { MockArlasStartupService } from '../../../tools/test';
import { CogVisualisationManagerComponent } from './cog-visualisation-manager.component';

describe('CogVisualisationManagerComponent', () => {
  let component: CogVisualisationManagerComponent;
  let fixture: ComponentFixture<CogVisualisationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CogVisualisationManagerComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        }),
        RouterModule.forRoot([]),
      ],
      providers: [
        ArlasCollectionService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        VisualizeService,
        ContributorService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CogVisualisationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
