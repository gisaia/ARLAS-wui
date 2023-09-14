import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomConfigListComponent } from './custom-config-list.component';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';
import { TranslateModule } from '@ngx-translate/core';

describe('CustomConfigListComponent', () => {
  let component: CustomConfigListComponent;
  let fixture: ComponentFixture<CustomConfigListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArlasToolKitModule, TranslateModule.forRoot(),
      ],
      declarations: [CustomConfigListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomConfigListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
