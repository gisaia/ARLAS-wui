import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockArlasStartupService } from '../tools/test';
import { ArlasWuiMapService } from './map.service';

describe('MapService', () => {
  let service: ArlasWuiMapService<any, any, any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
        })
      ],
      providers: [
        {
          provide: ArlasStartupService,
          useClass: MockArlasStartupService
        }
      ]
    });
    service = TestBed.inject(ArlasWuiMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
