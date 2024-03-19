import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodingComponent } from './geocoding.component';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeocodingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
