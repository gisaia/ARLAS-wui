import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { GeocodingComponent } from './geocoding.component';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } }),
        GeocodingComponent
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
