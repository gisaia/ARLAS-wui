import { TestBed } from '@angular/core/testing';

import { LayerStyleManagerService } from './layer-style-manager.service';

describe('LayerStyleManagerService', () => {
  let service: LayerStyleManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerStyleManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
