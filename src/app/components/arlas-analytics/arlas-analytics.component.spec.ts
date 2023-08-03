import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasAnalyticsComponent } from './arlas-analytics.component';

describe('ArlasAnalyticsComponent', () => {
  let component: ArlasAnalyticsComponent;
  let fixture: ComponentFixture<ArlasAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArlasAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
