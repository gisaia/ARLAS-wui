import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersChipsComponent } from './filters-chips.component';
import { MatBasicChip, MatChipsModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { ContributorService } from '../../services/contributors.service';
import { HttpModule } from '@angular/http';
import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';

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
