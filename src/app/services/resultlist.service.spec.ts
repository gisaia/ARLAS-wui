import { TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ResultlistService } from './resultlist.service';


describe('ResultlistService', () => {
  let service: ResultlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        ArlasCollaborativesearchService
      ],
      teardown: { destroyAfterEach: false }
    });
    service = TestBed.inject(ResultlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
