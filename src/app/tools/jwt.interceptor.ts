import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
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

    if (authentMode === 'openid') {
      const hasValidAccessToken = this.authenticationService.hasValidAccessToken();
      // add authorization header with accessToken to ALL Http request
      if (hasValidAccessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.authenticationService.accessToken}`,
          }
        });
        return next.handle(request);
      }
    } else if (authentMode === 'iam') {
      this.iamService.tokenRefreshed$.subscribe({
        next: (data) => {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${data.accessToken}`,
            }
          });
          next.handle(request);
        }
      });
    } else {
      return next.handle(request);
    }
  }
}
