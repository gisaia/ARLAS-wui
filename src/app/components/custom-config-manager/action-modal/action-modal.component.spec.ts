import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionModalComponent } from './action-modal.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DateTimeProvider, OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';
import { AuthentificationService, GET_OPTIONS, getOptionsFactory } from 'arlas-wui-toolkit';
import { ActivatedRoute } from '@angular/router';
class MockActivatedRoute {
  public parent = {
    snapshot: { data: { title: 'myTitle ' } },
    routeConfig: { children: { filter: () => { } } }
  };
}
describe('ActionModalComponent', () => {
  let component: ActionModalComponent;
  let fixture: ComponentFixture<ActionModalComponent>;

  beforeEach(async(() => {
    const mockDialogRef = {
      close: jasmine.createSpy('close')
    };
    TestBed.configureTestingModule({
      declarations: [ActionModalComponent],
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        MatMenuModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        HttpClientModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        AuthentificationService,
        OAuthService,
        OAuthLogger,
        DateTimeProvider,
        UrlHelperService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: GET_OPTIONS,
          useFactory: getOptionsFactory,
          deps: [AuthentificationService]
        }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
