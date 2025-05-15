import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasToolKitModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ContributorService } from '../../services/contributors.service';
import { VisualizeService } from '../../services/visualize.service';
import { ArlasWuiMapComponent } from './arlas-map.component';

describe('ArlasWuiMapComponent', () => {
  let component: ArlasWuiMapComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasWuiMapComponent<any, any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasWuiMapComponent ],
      imports: [
        ArlasToolKitModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        ArlasToolkitSharedModule
      ],
      providers: [
        VisualizeService,
        ContributorService
      ],
      teardown: { destroyAfterEach: false }
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArlasWuiMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
