import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  it('createIntent envía el monto al backend', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(PaymentService)
      .createIntent(150)
      .subscribe((res) => expect(res.clientSecret).toBe('secret'));

    const req = http.expectOne(`${environment.apiUrl}/payments/create-intent`);
    expect(req.request.body).toEqual({ amount: 150 });
    req.flush({ clientSecret: 'secret' });
    http.verify();
  });
});
