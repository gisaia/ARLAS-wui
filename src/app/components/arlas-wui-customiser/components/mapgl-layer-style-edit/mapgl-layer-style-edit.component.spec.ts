import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapglLayerStyleEditComponent } from './mapgl-layer-style-edit.component';

describe('MapglLayerStyleEditComponent', () => {
  let component: MapglLayerStyleEditComponent;
  let fixture: ComponentFixture<MapglLayerStyleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapglLayerStyleEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapglLayerStyleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
