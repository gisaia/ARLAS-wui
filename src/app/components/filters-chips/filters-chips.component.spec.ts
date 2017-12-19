import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersChipsComponent } from './filters-chips.component';
import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from '../../services/arlaswui.startup.service';
import { MatBasicChip, MatChipsModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { ContributorService } from '../../services/contributors.service';

describe('FiltersChipsComponent', () => {
  let component: FiltersChipsComponent;
  let fixture: ComponentFixture<FiltersChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, MatIconModule, MatTooltipModule],
      declarations: [FiltersChipsComponent],
      providers: [ArlasWuiConfigService, ArlasWuiCollaborativesearchService, ContributorService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
