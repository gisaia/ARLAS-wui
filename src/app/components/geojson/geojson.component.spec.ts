import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeojsonComponent } from './geojson.component';
import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { ContributorService } from 'app/services/contributors.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatInputModule, MatIconModule,
  MatDialogModule, MatStepperModule, MatRadioModule,
  MatSelect, MatSelectModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';

describe('GeojsonComponent', () => {
  let component: GeojsonComponent;
  let fixture: ComponentFixture<GeojsonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, MatAutocompleteModule,
        MatInputModule, FormsModule, BrowserAnimationsModule,
        MatIconModule, HttpModule, MatDialogModule, MatStepperModule,
        MatRadioModule, MatSelectModule
      ],
      declarations: [GeojsonComponent],
      providers: [ArlasConfigService, ArlasCollaborativesearchService, ContributorService, ArlasStartupService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeojsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
