import { DialogPaletteSelectorComponent } from './dialog-palette-selector.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '../../services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';

export class MatDialogRefMock {
  public updateSize() {

  }
}

describe('DialogPaletteSelectorComponent', () => {
  let component: DialogPaletteSelectorComponent;
  let fixture: ComponentFixture<DialogPaletteSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }
        }),
        MatCheckboxModule
      ],
      declarations: [
        DialogPaletteSelectorComponent

      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        },
        {
          provide: MAT_DIALOG_DATA, useValue:
            { defaultPalettes: [], selectedPalette: '' }
        },

        CollectionService,
        ArlasCollaborativesearchService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPaletteSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



