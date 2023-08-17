import { EditResultlistColumnsComponent } from './edit-resultlist-columns.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { FormArray } from '@angular/forms';
import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';

describe('EditResultlistColumnsComponent', () => {
  let spectator: Spectator<EditResultlistColumnsComponent>;

  const createComponent = createComponentFactory({
    component: EditResultlistColumnsComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent)
    ],
    providers: [
      mockProvider(ResultlistFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new FormArray([])
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
