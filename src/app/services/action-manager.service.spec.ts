import { TestBed } from '@angular/core/testing';

import { ActionManagerService } from './action-manager.service';

describe('ActionManagerService', () => {
  let service: ActionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
