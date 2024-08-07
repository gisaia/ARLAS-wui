import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GeocodingComponent} from './geocoding.component';
import {HttpClientModule} from '@angular/common/http';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule,  MatInputModule, MatIconModule, BrowserAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        MatFormFieldModule, ReactiveFormsModule, MatTableModule],
      declarations: [ GeocodingComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
