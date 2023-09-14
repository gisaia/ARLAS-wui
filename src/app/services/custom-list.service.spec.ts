import { TestBed } from '@angular/core/testing';

import { CustomListService } from './custom-list.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';

export class MatDialogRefMock {
  public updateSize() {

  }
}

describe('CustomListService', () => {
  let service: CustomListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArlasToolKitModule, MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        }]
    });
    service = TestBed.inject(CustomListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
