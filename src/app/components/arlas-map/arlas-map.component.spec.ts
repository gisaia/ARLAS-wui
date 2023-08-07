import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasMapComponent } from './arlas-map.component';
import { ResultlistService } from 'app/services/resultlist.service';
import { MapService } from 'app/services/map.service';
import { CrossMapService } from 'app/services/cross-tabs-communication/cross.map.service';
import { ArlasToolKitModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { VisualizeService } from 'app/services/visualize.service';
import { CrossCollaborationsService } from 'app/services/cross-tabs-communication/cross.collaboration.service';
import { CrossResultlistService } from 'app/services/cross-tabs-communication/cross.resultlist.service';
import { DynamicComponentService } from 'app/services/dynamicComponent.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('ArlasMapComponent', () => {
  let component: ArlasMapComponent;
  let fixture: ComponentFixture<ArlasMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArlasMapComponent],
      imports: [ArlasToolkitSharedModule, ArlasToolKitModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),],
      providers: [ResultlistService, MapService, CrossMapService, CrossCollaborationsService,
        VisualizeService, CrossResultlistService, DynamicComponentService]

    }).compileComponents();

    fixture = TestBed.createComponent(ArlasMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
