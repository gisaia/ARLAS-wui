import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ArlasWuiCollaborativesearchService, ArlasWuiConfigService } from './services/arlaswui.startup.service';
import { ContributorService } from './services/contributors.service';
import { MapglComponent, HistogramComponent } from 'arlas-web-components';
import { SearchComponent } from 'app/components/search/search.component';
import { FiltersChipsComponent } from 'app/components/filters-chips/filters-chips.component';
import { ErrorModalComponent } from './components/errormodal/errormodal.component';
import { MatIcon, MatIconModule, MatAutocompleteModule, MatInputModule, MatChipsModule, MatTooltipModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { routing } from './app.routes';
import { APP_BASE_HREF } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule,
        FormsModule, MatChipsModule, MatTooltipModule, HttpModule, RouterModule, routing
      ],
      declarations: [
        AppComponent,
        MapglComponent, HistogramComponent, SearchComponent, FiltersChipsComponent, ErrorModalComponent
      ],
      providers: [
        ArlasWuiCollaborativesearchService,
        ArlasWuiConfigService,
        ContributorService,
        {provide: APP_BASE_HREF, useValue : '/' }
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render title "ARLAS"', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.query(By.css('.home-chip')).nativeElement;
    expect(compiled.textContent).toContain('ARLAS');
  }));
});
