import { MatCheckboxModule } from '@angular/material/checkbox';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';

import { FiltersComponent, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '../color-picker-wrapper/color-picker-wrapper.component';
import { ConfigFormControlComponent } from './config-form-control.component';
import { CollectionService } from '../../services/collection-service/collection.service';
import { SlideToggleFormControl } from '../../models/config-form';


describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    imports: [
      MatCheckboxModule
    ],
    declarations: [
      MockComponent(ColorPickerWrapperComponent),
      MockComponent(FiltersComponent),
    ],
    providers: [
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new SlideToggleFormControl('', '', '')
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
