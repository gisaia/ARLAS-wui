import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CogVisualisationManagerComponent } from './cog-visualisation-manager.component';

describe('CogVisualisationManagerComponent', () => {
  let component: CogVisualisationManagerComponent;
  let fixture: ComponentFixture<CogVisualisationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CogVisualisationManagerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CogVisualisationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
