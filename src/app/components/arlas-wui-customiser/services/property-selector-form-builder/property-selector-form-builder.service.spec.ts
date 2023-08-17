import { PropertySelectorFormBuilderService } from './property-selector-form-builder.service';
import { CollectionService } from '../collection-service/collection.service';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { DefaultValuesService } from '../default-values/default-values.service';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('PropertySelectorFormBuilderService', () => {
  let service: PropertySelectorFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }
        })
      ],
      providers: [
        DefaultValuesService,
        ArlasCollaborativesearchService,
        CollectionService
      ]
    });
    service = TestBed.inject(PropertySelectorFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


