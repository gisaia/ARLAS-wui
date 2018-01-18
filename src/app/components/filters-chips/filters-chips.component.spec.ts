import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersChipsComponent } from './filters-chips.component';
import { MatBasicChip, MatChipsModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { ContributorService } from '../../services/contributors.service';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';
import { ArlasStartupService } from 'arlas-wui-toolkit/services/startup.services';
import { HttpModule } from '@angular/http';

describe('FiltersChipsComponent', () => {
  let component: FiltersChipsComponent;
  let fixture: ComponentFixture<FiltersChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, MatIconModule, MatTooltipModule, HttpModule],
      declarations: [FiltersChipsComponent],
      providers: [ArlasConfigService, ArlasCollaborativesearchService, ContributorService, ArlasStartupService]
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
