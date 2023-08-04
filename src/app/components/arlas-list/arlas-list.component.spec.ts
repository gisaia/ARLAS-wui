import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasListComponent } from './arlas-list.component';

describe('ArlasListComponent', () => {
  let component: ArlasListComponent;
  let fixture: ComponentFixture<ArlasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArlasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
