import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { OAuthModule } from 'angular-oauth2-oidc';
import { OrderFormService } from './order-form.service';

describe('OrderFormService', () => {
  let service: OrderFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot()
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
      ]
    });
    service = TestBed.inject(OrderFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
