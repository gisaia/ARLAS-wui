import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualisationLegendComponent } from './visualisation-legend.component';

describe('VisualisationLegendComponent', () => {
  let component: VisualisationLegendComponent;
  let fixture: ComponentFixture<VisualisationLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualisationLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualisationLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
