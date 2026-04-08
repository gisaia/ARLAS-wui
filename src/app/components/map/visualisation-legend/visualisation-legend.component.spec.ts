import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../../services/contributors.service';
import { VisualizeService } from '../../../services/visualize.service';
import { MockArlasStartupService } from '../../../tools/test';
import { VisualisationLegendComponent } from './visualisation-legend.component';

describe('VisualisationLegendComponent', () => {
  let component: VisualisationLegendComponent;
  let fixture: ComponentFixture<VisualisationLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VisualisationLegendComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        })
      ],
      providers: [
        VisualizeService,
        ContributorService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VisualisationLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
