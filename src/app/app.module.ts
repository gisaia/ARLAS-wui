import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HistogramModule, MapglModule } from 'arlas-web-components';

import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MdButtonModule,
  MdChipsModule,
  MdDialogModule,
  MdIconModule,
  MdSidenavModule,
  MdTooltipModule
} from '@angular/material';

import { ArlasWuiStartupService, ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { ConfigService } from 'arlas-web-core';
import { ExploreApi } from 'arlas-api';

import { AppComponent } from './app.component';
import { ErrorModalComponent, ErrorModalMsgComponent } from './components/errormodal/errormodal.component';
import { SearchComponent } from './components/search/search.component';


export function startupServiceFactory(startupService: ArlasWuiStartupService): Function {
  return () => startupService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    ErrorModalComponent,
    ErrorModalMsgComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    MdButtonModule,
    MdChipsModule,
    MdDialogModule,
    MdIconModule,
    MdSidenavModule,
    MdTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MapglModule,
    HistogramModule
  ],
  providers: [
    ArlasWuiConfigService,
    ArlasWuiCollaborativesearchService,
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
