import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
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
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
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
