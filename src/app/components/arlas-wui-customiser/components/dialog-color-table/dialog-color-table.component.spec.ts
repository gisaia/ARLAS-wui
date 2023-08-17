import { DialogColorTableComponent } from './dialog-color-table.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CollectionService } from '../../services/collection-service/collection.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigFormControlComponent } from '../config-form-control/config-form-control.component';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule} from 'arlas-web-components';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';

export class MatDialogRefMock {
  public updateSize() {

  }
}

describe('DialogColorTableComponent', () => {
  let component: DialogColorTableComponent;
  let fixture: ComponentFixture<DialogColorTableComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }
        }),
        MatCheckboxModule
      ],
      declarations: [
        DialogColorTableComponent

      ],
      providers: [
        TranslateService,
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        },
        ArlasCollaborativesearchService,
        ArlasColorService,
        CollectionService,
        {
          provide: MAT_DIALOG_DATA, useValue: {
            collection: '',
            sourceField: '',
            keywordColors: []
          }
        }
      ]
    }).compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(DialogColorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
