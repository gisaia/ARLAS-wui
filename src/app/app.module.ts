import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

import { HistogramModule, MapglModule } from 'arlas-web-components';

import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatChipsModule,
  MatIconModule,
  MatTooltipModule,
  MatProgressBarModule
} from '@angular/material';

import { ContributorService } from './services/contributors.service';
import { ConfigService } from 'arlas-web-core';
import { ExploreApi } from 'arlas-api';

import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';
import { FiltersChipsComponent } from './components/filters-chips/filters-chips.component';
import { routing } from './app.routes';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    FiltersChipsComponent
  ],
  imports: [
    BrowserModule,
    TagInputModule,
    BrowserAnimationsModule,
    HttpModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    MapglModule,
    HistogramModule,
    RouterModule,
    routing,
    ArlasToolKitModule
  ],
  providers: [
    ContributorService,
    ExploreApi
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
