import { Overlay } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasCollaborativesearchService, ArlasCollectionService, ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockArlasStartupService } from '../tools/test';
import { ContributorService } from './contributors.service';
import { ResultlistService } from './resultlist.service';
import { VisualizeService } from './visualize.service';

describe('ResultlistService', () => {
    let service: ResultlistService<any, any, any>;

    beforeEach(() => {
        const mockArlasCollectionService = {
            appUnits: new Map()
        };

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
                RouterModule.forRoot([]),
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
