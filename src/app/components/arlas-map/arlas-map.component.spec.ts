import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { VisualizeService } from 'app/services/visualize.service';
import { ArlasToolKitModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ArlasMapComponent } from './arlas-map.component';

describe('ArlasMapComponent', () => {
  let component: ArlasMapComponent;
  let fixture: ComponentFixture<ArlasMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasMapComponent ],
      imports: [
        ArlasToolKitModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        ArlasToolkitSharedModule
      ],
      providers: [
        VisualizeService
      ],
      teardown: { destroyAfterEach: false }
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArlasMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
