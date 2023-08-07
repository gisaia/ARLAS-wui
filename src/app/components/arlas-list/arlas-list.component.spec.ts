import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArlasListComponent } from './arlas-list.component';
import { ResultlistService } from 'app/services/resultlist.service';
import { CrossMapService } from 'app/services/cross-tabs-communication/cross.map.service';
import { MapService } from 'app/services/map.service';
import { ArlasToolkitSharedModule, ArlasToolKitModule } from 'arlas-wui-toolkit';
import { VisualizeService } from 'app/services/visualize.service';

describe('ArlasListComponent', () => {
  let component: ArlasListComponent;
  let fixture: ComponentFixture<ArlasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArlasListComponent],
      imports: [ArlasToolkitSharedModule, ArlasToolKitModule],
      providers: [ResultlistService, CrossMapService, MapService, VisualizeService]
    })
      .compileComponents();
    fixture = TestBed.createComponent(ArlasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
