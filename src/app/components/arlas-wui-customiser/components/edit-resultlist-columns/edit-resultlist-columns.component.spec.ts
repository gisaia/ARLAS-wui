import { EditResultlistColumnsComponent } from './edit-resultlist-columns.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '../../services/collection-service/collection.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

export class MatDialogRefMock {
  public updateSize() {

  }
}
describe('EditResultlistColumnsComponent', () => {
  let component: EditResultlistColumnsComponent;
  let fixture: ComponentFixture<EditResultlistColumnsComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatTableModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ColorGeneratorModule.forRoot({
          loader: {
            provide: ColorGeneratorLoader,
            useClass: AwcColorGeneratorLoader
          }
        }),
      ],
      declarations: [
        EditResultlistColumnsComponent

      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MatDialogRefMock
        },
        CollectionService,
        ArlasCollaborativesearchService
      ]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(EditResultlistColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
