import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { ContributorService } from '../../../services/contributors.service';
import { VisualizeService } from '../../../services/visualize.service';
import { MockArlasStartupService } from '../../../tools/test';
import { CogPixelLegendComponent } from './cog-pixel-legend.component';

describe('CogPixelLegendComponent', () => {
  let component: CogPixelLegendComponent;
  let fixture: ComponentFixture<CogPixelLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CogPixelLegendComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
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
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CogPixelLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
