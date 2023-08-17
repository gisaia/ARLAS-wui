import { HttpClientModule } from '@angular/common/http';
import { ColorPickerWrapperComponent } from './color-picker-wrapper.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ColorPickerWrapperComponent', () => {
  let component: ColorPickerWrapperComponent;
  let fixture: ComponentFixture<ColorPickerWrapperComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule

      ],
      declarations: [ColorPickerWrapperComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
