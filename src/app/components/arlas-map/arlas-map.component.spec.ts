import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasMapComponent } from './arlas-map.component';

describe('ArlasMapComponent', () => {
  let component: ArlasMapComponent;
  let fixture: ComponentFixture<ArlasMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArlasMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
