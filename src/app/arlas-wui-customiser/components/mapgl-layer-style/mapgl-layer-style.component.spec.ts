import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerStyleComponent } from './mapgl-layer-style.component';

describe('LayerStyleComponent', () => {
  let component: LayerStyleComponent;
  let fixture: ComponentFixture<LayerStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerStyleComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LayerStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
