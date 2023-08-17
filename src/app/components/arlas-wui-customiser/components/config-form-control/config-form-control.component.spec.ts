import { MatCheckboxModule } from '@angular/material/checkbox';

import { ConfigFormControlComponent } from './config-form-control.component';
import { CollectionService } from '../../services/collection-service/collection.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArlasColorService } from 'arlas-web-components';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule} from 'arlas-web-components';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { SlideToggleFormControl } from '../../models/config-form';
describe('ConfigFormControlComponent', () => {
  let component: ConfigFormControlComponent;
  let fixture: ComponentFixture<ConfigFormControlComponent>;

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
        ConfigFormControlComponent

      ],
      providers: [
        CollectionService,
        ArlasCollaborativesearchService,
        ArlasColorService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigFormControlComponent);
    component = fixture.componentInstance;
    component.control = new SlideToggleFormControl('', '', '');
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
