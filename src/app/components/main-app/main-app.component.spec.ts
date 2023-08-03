import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAppComponent } from './main-app.component';

describe('MainAppComponent', () => {
  let component: MainAppComponent;
  let fixture: ComponentFixture<MainAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
