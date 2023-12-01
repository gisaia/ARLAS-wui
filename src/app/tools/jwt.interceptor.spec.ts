import { TestBed } from '@angular/core/testing';
import { DateTimeProvider, OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthentificationService } from 'arlas-wui-toolkit';
import { HttpClientModule } from '@angular/common/http';

describe('JwtInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule
    ],
    providers: [
      AuthentificationService,
      OAuthService,
      OAuthLogger,
      DateTimeProvider,
      UrlHelperService,
      JwtInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: JwtInterceptor = TestBed.inject(JwtInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
