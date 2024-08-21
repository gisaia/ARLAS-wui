import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterSelectorComponent } from './parameter-selector.component';

describe('ParameterSelectorComponent', () => {
  let component: ParameterSelectorComponent;
  let fixture: ComponentFixture<ParameterSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterSelectorComponent ],
      imports: [ HttpClientModule ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ParameterSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
