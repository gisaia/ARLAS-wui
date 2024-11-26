import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { VisualizeService } from 'app/services/visualize.service';
import { ArlasToolKitModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ArlasListComponent } from './arlas-list.component';

describe('ArlasListComponent', () => {
  let component: ArlasListComponent;
  let fixture: ComponentFixture<ArlasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArlasListComponent ],
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

    fixture = TestBed.createComponent(ArlasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
