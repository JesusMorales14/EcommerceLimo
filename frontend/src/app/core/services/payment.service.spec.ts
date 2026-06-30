import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { PaymentService } from './payment.service';
import { environment } from '../../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    delete (globalThis as any).Stripe;
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('createIntent', () => {
    it('hace POST /payments/create-intent con el monto', () => {
      let result: { clientSecret: string } | undefined;
      service.createIntent(100).subscribe(r => (result = r));

      const req = http.expectOne(`${base}/payments/create-intent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount: 100 });
      req.flush({ clientSecret: 'secret_123' });

      expect(result).toEqual({ clientSecret: 'secret_123' });
    });

    it('propaga error si la creación del intent falla', () => {
      let errorResult: unknown;
      service.createIntent(100).subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/payments/create-intent`).flush(
        { message: 'Error de pago' },
        { status: 500, statusText: 'Server Error' }
      );

      expect((errorResult as { status: number }).status).toBe(500);
    });
  });

  describe('getStripe', () => {
    it('retorna null si Stripe no está definido globalmente', () => {
      expect(service.getStripe()).toBeNull();
    });

    it('crea e inicializa Stripe con la clave pública cuando está disponible', () => {
      const stripeInstance = { id: 'stripe-instance' };
      const stripeFactory = vi.fn().mockReturnValue(stripeInstance);
      (globalThis as any).Stripe = stripeFactory;

      const result = service.getStripe();

      expect(stripeFactory).toHaveBeenCalledWith(environment.stripePublicKey);
      expect(result).toBe(stripeInstance);
    });

    it('reutiliza la instancia de Stripe ya creada (no la vuelve a crear)', () => {
      const stripeFactory = vi.fn().mockReturnValue({ id: 'stripe-instance' });
      (globalThis as any).Stripe = stripeFactory;

      service.getStripe();
      service.getStripe();

      expect(stripeFactory).toHaveBeenCalledTimes(1);
    });
  });
});
