import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ArlasWuiMapService } from './map.service';

describe('MapService', () => {
  let service: ArlasWuiMapService<any, any, any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArlasWuiMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
