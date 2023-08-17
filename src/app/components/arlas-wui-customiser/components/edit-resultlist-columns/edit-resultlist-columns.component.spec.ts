import { EditResultlistColumnsComponent } from './edit-resultlist-columns.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { FormArray } from '@angular/forms';
import { ConfigFormControlComponent } from '../config-form-control/config-form-control.component';

describe('EditResultlistColumnsComponent', () => {
  let spectator: Spectator<EditResultlistColumnsComponent>;

  const createComponent = createComponentFactory({
    component: EditResultlistColumnsComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent)
    ],
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
