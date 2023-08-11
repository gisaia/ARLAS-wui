import { PropertySelectorFormBuilderService } from './property-selector-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '../collection-service/collection.service';
import { ArlasColorService } from 'arlas-web-components';

describe('PropertySelectorFormBuilderService', () => {
  let spectator: SpectatorService<PropertySelectorFormBuilderService>;

  const createService = createServiceFactory({
    service: PropertySelectorFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
