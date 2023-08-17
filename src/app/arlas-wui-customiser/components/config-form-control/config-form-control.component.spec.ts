import { ConfigFormControlComponent } from './config-form-control.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SlideToggleFormControl } from '@shared-models/config-form';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FiltersComponent } from '@map-config/components/filters/filters.component';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionsUnitsComponent } from '@look-and-feel-config/components/collections-units/collections-units.component';

describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    imports: [
      MatCheckboxModule
    ],
    declarations: [
      ResetOnChangeDirective,
      AlertOnChangeDirective,
      MockComponent(ColorPickerWrapperComponent),
      MockComponent(FiltersComponent),
      MockComponent(CollectionsUnitsComponent)
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
