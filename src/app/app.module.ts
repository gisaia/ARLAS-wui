import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

import { HistogramModule, MapglModule } from 'arlas-web-components';

import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatIconModule,
  MatSidenavModule,
  MatTooltipModule,
  MatProgressBarModule

} from '@angular/material';

import { ArlasWuiStartupService, ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { ContributorService } from './services/contributors.service';

import { ConfigService } from 'arlas-web-core';
import { ExploreApi } from 'arlas-api';

import { AppComponent } from './app.component';
import { ErrorModalComponent, ErrorModalMsgComponent } from './components/errormodal/errormodal.component';
import { SearchComponent } from './components/search/search.component';
import { FiltersChipsComponent } from './components/filters-chips/filters-chips.component';
import { routing } from './app.routes';


export function startupServiceFactory(startupService: ArlasWuiStartupService): Function {
  return () => startupService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    ErrorModalComponent,
    ErrorModalMsgComponent,
    SearchComponent,
    FiltersChipsComponent
  ],
  imports: [
    BrowserModule,
    TagInputModule,
    BrowserAnimationsModule,
    HttpModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    MapglModule,
    HistogramModule,
    RouterModule,
    routing
  ],
  providers: [
    ArlasWuiConfigService,
    ArlasWuiCollaborativesearchService,
    ContributorService,
    ExploreApi,
    ConfigService,
    ArlasWuiStartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: startupServiceFactory,
      deps: [ArlasWuiStartupService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
