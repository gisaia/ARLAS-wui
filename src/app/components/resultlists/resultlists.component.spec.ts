import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArlasStartupService, ArlasToolkitSharedModule, ArlasConfigurationUpdaterService,
  CONFIG_UPDATER, FETCH_OPTIONS } from 'arlas-wui-toolkit';

import { ResultlistsComponent } from './resultlists.component';
import { APP_BASE_HREF } from '@angular/common';

describe('ResultlistsComponent', () => {
  let component: ResultlistsComponent;
  let fixture: ComponentFixture<ResultlistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultlistsComponent ],
      imports: [
        ArlasToolkitSharedModule
      ],
      providers: [
        {
          provide: ArlasStartupService,
          useClass: ArlasStartupService,
          deps: [ArlasConfigurationUpdaterService]
        },
        {
          provide: ArlasConfigurationUpdaterService,
          useClass: ArlasConfigurationUpdaterService
        },
        { provide: CONFIG_UPDATER, useValue: {} },
        { provide: FETCH_OPTIONS, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultlistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
