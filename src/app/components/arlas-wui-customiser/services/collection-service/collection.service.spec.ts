import { CollectionService } from './collection.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '../default-values/default-values.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';


describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
      ],
      providers: [
        ArlasCollaborativesearchService,
        DefaultValuesService,
        TranslateService]
    });
    service = TestBed.inject(CollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


