import { TestBed } from '@angular/core/testing';

import { CogService } from './cog.service';

describe('CogService', () => {
  let service: CogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
