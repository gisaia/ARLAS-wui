import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapglLayerStyleComponent } from './mapgl-layer-style.component';

describe('MapglLayerStyleComponent', () => {
  let component: MapglLayerStyleComponent;
  let fixture: ComponentFixture<MapglLayerStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapglLayerStyleComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapglLayerStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
