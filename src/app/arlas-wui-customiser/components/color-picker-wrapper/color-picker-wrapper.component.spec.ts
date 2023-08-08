import { ColorPickerWrapperComponent } from './color-picker-wrapper.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '../../services/default-values/default-values.service';

describe('ColorPickerComponent', () => {
  let spectator: Spectator<ColorPickerWrapperComponent>;

  const createComponent = createComponentFactory({
    component: ColorPickerWrapperComponent,
    providers: [
      mockProvider(DefaultValuesService, {
        getDefaultConfig: () => ({ config: { colorPickerPresets: [] } })
      })
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a color picker input', () => {
    expect(spectator.queryAll('ngx-color-picker')).toBeDefined();
  });
});
