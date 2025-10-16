import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CogPixelLegendComponent } from './cog-pixel-legend.component';

describe('CogPixelLegendComponent', () => {
  let component: CogPixelLegendComponent;
  let fixture: ComponentFixture<CogPixelLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CogPixelLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CogPixelLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
