/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HistogramModule, MapglImportModule, MapglModule, MapglSettingsModule, ResultsModule } from 'arlas-web-components';
import {
  ArlasSettingsService, ArlasTaggerModule, ArlasToolKitModule,
  ArlasToolkitSharedModule, ArlasWalkthroughModule,
  CUSTOM_LOAD,
  PaginatorI18n,
  PersistenceService, ToolkitRoutingModule, WalkthroughLoader
} from 'arlas-wui-toolkit';
import { MarkdownModule } from 'ngx-markdown';
import { ArlasWuiComponent } from './app.component';
import { AboutComponent, AboutDialogComponent } from './components/about/about.component';
import { ConfigsListComponent } from './components/configs-list/configs-list.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { ContributorService } from './services/contributors.service';
import { DynamicComponentService } from './services/dynamicComponent.service';
import { SidenavService } from './services/sidenav.service';
import { VisualizeService } from './services/visualize.service';
import { ArlasTranslateLoader, ArlasWalkthroughLoader } from './tools/customLoader';
import { LayerStyleManagerService } from './components/arlas-wui-customiser/services/layer-style-manager/layer-style-manager.service';
import { MapglLayerStyleComponent } from './components/arlas-wui-customiser/components/mapgl-layer-style/mapgl-layer-style.component';
/* eslint-disable max-len */
import { MapglLayerStyleEditComponent } from './components/arlas-wui-customiser/components/mapgl-layer-style-edit/mapgl-layer-style-edit.component';
import { ConfigFormComponent } from './components/arlas-wui-customiser/components/config-form/config-form.component';
import { DialogPaletteSelectorComponent } from './components/arlas-wui-customiser/components/dialog-palette-selector/dialog-palette-selector.component';
import { DialogColorTableComponent } from './components/arlas-wui-customiser/components/dialog-color-table/dialog-color-table.component';
import { DefaultValuesService } from './components/arlas-wui-customiser/services/default-values/default-values.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerWrapperComponent } from './components/arlas-wui-customiser/components/color-picker-wrapper/color-picker-wrapper.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EditResultlistColumnsComponent } from './components/arlas-wui-customiser/components/edit-resultlist-columns/edit-resultlist-columns.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfigFormControlComponent } from './components/arlas-wui-customiser/components/config-form-control/config-form-control.component';
import { UserPreferencesService } from './services/user-preferences/user-preferences.service';
import { CustomConfigListComponent } from './components/custom-config-manager/custom-config-list/custom-config-list.component';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { ActionModalComponent } from './components/custom-config-manager/action-modal/action-modal.component';
import { ConfigMenuComponent } from './components/custom-config-manager/config-menu/config-menu.component';
import { ShareConfigComponent } from './components/custom-config-manager/share-config/share-config.component';
import { GetConfigListNamePipe } from './components/custom-config-manager/tools/get-config-list-name.pipe';

export function loadServiceFactory(defaultValuesService: DefaultValuesService) {
  const load = () => defaultValuesService.load('default.json?' + Date.now());
  return load;
}

export function loadUserPreferences(userPreferencesService: UserPreferencesService) {
  const load = (data) => userPreferencesService.load().then(() => Promise.resolve(data));
  return load;
}

@NgModule({
  declarations: [
    AboutComponent,
    AboutDialogComponent,
    ArlasWuiComponent,
    LeftMenuComponent,
    ConfigsListComponent,
    MapglLayerStyleComponent,
    MapglLayerStyleEditComponent,
    ConfigFormComponent,
    EditResultlistColumnsComponent,
    DialogPaletteSelectorComponent,
    DialogColorTableComponent,
    ColorPickerWrapperComponent,
    ConfigFormControlComponent,
    CustomConfigListComponent,
    ActionModalComponent,
    ConfigMenuComponent,
    ShareConfigComponent,
    GetConfigListNamePipe
  ],
  exports: [
    AboutComponent,
    AboutDialogComponent,
    ArlasWuiComponent,
    LeftMenuComponent,
    ConfigsListComponent,
    MapglLayerStyleComponent,
    MapglLayerStyleEditComponent,
    EditResultlistColumnsComponent,
    DialogPaletteSelectorComponent,
    DialogColorTableComponent,
    ColorPickerWrapperComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    MapglImportModule,
    MapglSettingsModule,
    ColorPickerModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatStepperModule,
    MatSelectModule,
    MatSlideToggleModule,
    MarkdownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ResultsModule,
    MapglModule,
    MatTableModule,
    MatListModule,
    MatSidenavModule,
    MatSliderModule,
    HistogramModule,
    ToolkitRoutingModule,
    ArlasToolkitSharedModule,
    ArlasToolKitModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: ArlasTranslateLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService]
      }
    }),
    ArlasWalkthroughModule.forRoot({
      loader: {
        provide: WalkthroughLoader,
        useClass: ArlasWalkthroughLoader,
        deps: [HttpClient, ArlasSettingsService, PersistenceService, TranslateService]
      }
    }),
    ArlasTaggerModule
  ],
  providers: [
    ContributorService,
    SidenavService,
    DynamicComponentService,
    VisualizeService,
    LayerStyleManagerService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadServiceFactory,
      deps: [DefaultValuesService],
      multi: true
    },
    {
      provide: CUSTOM_LOAD,
      useFactory: loadUserPreferences,
      deps: [UserPreferencesService],
      multi: false
    },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService)
    },
    VisualizeService
  ],
  bootstrap: [ArlasWuiComponent],
  entryComponents: [AboutDialogComponent, EditResultlistColumnsComponent, CustomConfigListComponent,ActionModalComponent]
})
export class ArlasWuiModule { }
