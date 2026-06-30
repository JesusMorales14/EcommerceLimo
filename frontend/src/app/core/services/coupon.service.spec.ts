import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CouponService, type CouponResult } from './coupon.service';
import { environment } from '../../../environments/environment';

describe('CouponService', () => {
  let service: CouponService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CouponService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('validate', () => {
    it('hace GET /coupons/validate con code y amount como params', () => {
      const mockResult: CouponResult = {
        code: 'DESC10', discount: 10, isPercent: true, discountAmount: 5, finalAmount: 45,
      };
      let result: CouponResult | undefined;
      service.validate('DESC10', 50).subscribe(r => (result = r));

      const req = http.expectOne(r => r.url === `${base}/coupons/validate`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('code')).toBe('DESC10');
      expect(req.request.params.get('amount')).toBe('50');
      req.flush(mockResult);

      expect(result).toEqual(mockResult);
    });

    it('propaga error cuando el cupón es inválido', () => {
      let errorResult: unknown;
      service.validate('INVALIDO', 50).subscribe({ error: (e) => (errorResult = e) });

      const req = http.expectOne(r => r.url === `${base}/coupons/validate`);
      req.flush({ message: 'Cupón inválido' }, { status: 400, statusText: 'Bad Request' });

      expect((errorResult as { status: number }).status).toBe(400);
    });
  });

  describe('getAll', () => {
    it('hace GET /coupons y retorna la lista', () => {
      let result: any[] | undefined;
      service.getAll().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/coupons`);
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, code: 'DESC10' }]);

      expect(result?.length).toBe(1);
    });

    it('maneja una lista vacía', () => {
      let result: any[] | undefined;
      service.getAll().subscribe(r => (result = r));

      http.expectOne(`${base}/coupons`).flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('hace POST /coupons con los datos del cupón', () => {
      const data = { code: 'NUEVO', discount: 15, isPercent: true, minAmount: 0, maxUses: 100 };
      service.create(data).subscribe();

      const req = http.expectOne(`${base}/coupons`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush({ id: 1, ...data });
    });
  });

  describe('toggle', () => {
    it('hace PATCH /coupons/:id/toggle', () => {
      service.toggle(5).subscribe();

      const req = http.expectOne(`${base}/coupons/5/toggle`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({ id: 5, active: false });
    });
  });

  describe('delete', () => {
    it('hace DELETE /coupons/:id', () => {
      service.delete(5).subscribe();

      const req = http.expectOne(`${base}/coupons/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
