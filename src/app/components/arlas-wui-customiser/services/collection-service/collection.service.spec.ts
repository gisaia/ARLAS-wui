import { CollectionService } from './collection.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '../default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('CollectionService', () => {
  let spectator: SpectatorService<CollectionService>;
  const createService = createServiceFactory({
    service: CollectionService,
    mocks: [
      ArlasCollaborativesearchService,
      DefaultValuesService,
      TranslateService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
