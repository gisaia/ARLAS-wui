import { DefaultValuesService } from './default-values.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('DefaultValuesService', () => {
  let spectator: SpectatorService<DefaultValuesService>;
  const createService = createServiceFactory({
    service: DefaultValuesService
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
