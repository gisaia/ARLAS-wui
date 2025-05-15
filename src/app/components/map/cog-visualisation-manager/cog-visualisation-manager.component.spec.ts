import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasCollectionService, ArlasStartupService } from 'arlas-wui-toolkit';
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
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        ArlasCollectionService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        VisualizeService,
        ContributorService
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
