import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { MockArlasStartupService } from '../tools/test';
import { CogService } from './cog.service';
import { ContributorService } from './contributors.service';
import { VisualizeService } from './visualize.service';

describe('CogService', () => {
  let service: CogService<any, any, any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
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
        }
      ]
    });
    service = TestBed.inject(CogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
