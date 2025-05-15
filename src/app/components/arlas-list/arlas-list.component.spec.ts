import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ArlasToolKitModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ContributorService } from '../../services/contributors.service';
import { VisualizeService } from '../../services/visualize.service';
import { ArlasListComponent } from './arlas-list.component';

describe('ArlasListComponent', () => {
  let component: ArlasListComponent<any, any, any>;
  let fixture: ComponentFixture<ArlasListComponent<any, any, any>>;

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
        VisualizeService,
        ContributorService
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
