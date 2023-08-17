import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapglLayerStyleComponent } from './mapgl-layer-style.component';
import { PropertySelectorFormBuilderService } from '../../services/property-selector-form-builder/property-selector-form-builder.service';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefMock } from '../dialog-color-table/dialog-color-table.component.spec';
import { ArlasCollaborativesearchService, ArlasToolKitModule } from 'arlas-wui-toolkit';
import { CollectionService } from '../../services/collection-service/collection.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { of } from 'rxjs';
import { DefaultValuesService } from '../../services/default-values/default-values.service';


export class CollectionServiceMock {
  public  getDescribe(collection: string) {
    return of([]);
  }

  public getCollectionFields(collection: string){
    return of([]);

  }
}

export class DefaultValuesServiceMock {
  public getDefaultConfig(){
    return {};
  }
}



describe('MapglLayerStyleComponent', () => {
  let component: MapglLayerStyleComponent;
  let fixture: ComponentFixture<MapglLayerStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArlasToolKitModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }}),
        MatDialogModule,
        HttpClientModule
      ],
      providers: [PropertySelectorFormBuilderService,
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        },
        {
          provide: CollectionService,
          useClass: CollectionServiceMock
        },
        {
          provide: DefaultValuesService,
          useClass: DefaultValuesServiceMock
        },
        ArlasCollaborativesearchService],
      declarations: [MapglLayerStyleComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapglLayerStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


