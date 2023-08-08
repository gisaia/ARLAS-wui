import { PropertySelectorFormBuilderService } from './property-selector-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '../collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

describe('PropertySelectorFormBuilderService', () => {
  let spectator: SpectatorService<PropertySelectorFormBuilderService>;

  const createService = createServiceFactory({
    service: PropertySelectorFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorGeneratorLoader),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
