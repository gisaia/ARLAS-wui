import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CogService } from 'app/services/cog.service';
import { DataGroup } from 'arlas-web-components';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributorService } from '../../../services/contributors.service';
import { VisualizeService } from '../../../services/visualize.service';
import { MockArlasStartupService } from '../../../tools/test';
import { CogPixelLegendComponent } from './cog-pixel-legend.component';

const mockVisualisationId = 'testId';
const mockVisualizedCogs = new Map<string, DataGroup>();
mockVisualizedCogs.set(mockVisualisationId, { protocol: 'titiler', visualisationUrl: 'test', name: 'Test', filters: [] });

describe('CogPixelLegendComponent', () => {
  let component: CogPixelLegendComponent;
  let fixture: ComponentFixture<CogPixelLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CogPixelLegendComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        VisualizeService,
        ContributorService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        {
          provide: CogService,
          useValue: {
            visualisedCogs: mockVisualizedCogs
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CogPixelLegendComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cogId', mockVisualisationId);
    fixture.componentRef.setInput('position', { lng: 0, lat: 0 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
