import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContributorService } from '../../services/contributors.service';
import { MatAutocomplete, MatAutocompleteModule, MatInput, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, MatInputModule, FormsModule, BrowserAnimationsModule],
      declarations: [SearchComponent],
      providers: [ArlasConfigService, ArlasCollaborativesearchService, ContributorService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
