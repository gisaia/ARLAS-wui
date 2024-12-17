import { TestBed } from '@angular/core/testing';

import { MapWuiService } from './map.service';

describe('MapService', () => {
  let service: MapWuiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapWuiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
