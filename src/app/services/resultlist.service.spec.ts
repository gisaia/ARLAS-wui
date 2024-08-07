import { TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ResultlistService } from './resultlist.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { VisualizeService } from './visualize.service';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { MatLegacyDialog as MatDialog, MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';


describe('ResultlistService', () => {
  let service: ResultlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        OverlayModule,
        MatDialogModule
      ],
      providers: [
        ArlasCollaborativesearchService,
        MatSnackBar,
        VisualizeService,
        Overlay,
        MatDialog
      ],
      teardown: { destroyAfterEach: false }
    });
    service = TestBed.inject(ResultlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
