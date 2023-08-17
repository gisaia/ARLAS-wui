import { TestBed } from '@angular/core/testing';

import { LayerStyleManagerService } from './layer-style-manager.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('LayerStyleManagerService', () => {
  let service: LayerStyleManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[MatDialogModule]
    });
    service = TestBed.inject(LayerStyleManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
