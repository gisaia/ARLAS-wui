import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasCollaborativesearchService, ArlasCollectionService, ArlasStartupService } from 'arlas-wui-toolkit';
import { MockArlasStartupService } from '../tools/test';
import { ContributorService } from './contributors.service';
import { ResultlistService } from './resultlist.service';
import { VisualizeService } from './visualize.service';


describe('ResultlistService', () => {
  let service: ResultlistService<any, any, any>;

  beforeEach(() => {
    const mockArlasCollectionService = jasmine.createSpyObj('ArlasCollectionService', [], {
      appUnits: new Map()
    });

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        OverlayModule,
        MatDialogModule
      ],
      providers: [
        ArlasCollaborativesearchService,
        MatSnackBar,
        VisualizeService,
        Overlay,
        MatDialog,
        {
          provide: ArlasCollectionService,
          useValue: mockArlasCollectionService
        },
        ContributorService,
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        },
        provideHttpClient(withInterceptorsFromDi())
      ],
      teardown: { destroyAfterEach: false }
    });
    service = TestBed.inject(ResultlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
