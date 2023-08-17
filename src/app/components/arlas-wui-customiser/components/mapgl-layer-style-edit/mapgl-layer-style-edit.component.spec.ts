import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapglLayerStyleEditComponent } from './mapgl-layer-style-edit.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

export class MatDialogRefMock {
  public updateSize() {

  }
}
describe('MapglLayerStyleEditComponent', () => {
  let component: MapglLayerStyleEditComponent;
  let fixture: ComponentFixture<MapglLayerStyleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }
        }),
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        },
        {
          provide: MAT_DIALOG_DATA, useValue:
          {
            layerStyle: {}, layerSource: {}
          }
        }

      ],
      declarations: [MapglLayerStyleEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapglLayerStyleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
