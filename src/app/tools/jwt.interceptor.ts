import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArlasIamService, ArlasSettingsService, AuthentificationService } from 'arlas-wui-toolkit';
import { QUICKLOOK_HEADER } from 'arlas-web-components';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  public constructor(
    private authenticationService: AuthentificationService,
    private iamService: ArlasIamService,
    private settingsService: ArlasSettingsService
  ) {

  }

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Intercepts quicklook requests to add token
    if (!request.headers.has(QUICKLOOK_HEADER)) {
      return next.handle(request);
    }
    request = request.clone({
      headers: request.headers.delete(QUICKLOOK_HEADER)
    });

    const authSettings = this.settingsService.getAuthentSettings();
    let authentMode = !!authSettings ? authSettings.auth_mode : undefined;
    if (!!authSettings && !!authSettings.use_authent && !authentMode) {
      authentMode = 'openid';
    }

    // add authorization header with accessToken to Http request if logged
    if (authentMode === 'openid') {
      const hasValidAccessToken = this.authenticationService.hasValidAccessToken();
      if (hasValidAccessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.authenticationService.accessToken}`,
          }
        });
      }
    } else if (authentMode === 'iam') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.iamService.getAccessToken()}`,
        }
      });
    }
    return next.handle(request);
  }
}
