import { TestBed } from '@angular/core/testing';
import { MapImportService } from './map-import.service';

describe('MapImportService', () => {
  let service: MapImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
