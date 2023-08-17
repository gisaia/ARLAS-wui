import { MapImportService } from './map-import.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MapImportService', () => {
  let spectator: SpectatorService<MapImportService>;

  const createService = createServiceFactory({
    service: MapImportService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
