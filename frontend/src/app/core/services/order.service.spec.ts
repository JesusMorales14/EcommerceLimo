import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderService, type DeliveryInfo } from './order.service';
import { type Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

const mockOrder: Order = {
  id: 1,
  status: 'PENDING',
  total: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  userId: 1,
  items: [],
};

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('hace POST /orders con items, paymentMethod, delivery y couponCode', () => {
      const items = [{ productId: 1, quantity: 2 }];
      const delivery: DeliveryInfo = { name: 'Juan', phone: '999', address: 'Av. Test', notes: '' };
      service.createOrder(items, 'CARD', delivery, 'DESC10').subscribe();

      const req = http.expectOne(`${base}/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ items, paymentMethod: 'CARD', delivery, couponCode: 'DESC10' });
      req.flush(mockOrder);
    });

    it('hace POST /orders con campos opcionales undefined cuando no se proveen', () => {
      const items = [{ productId: 1, quantity: 1 }];
      service.createOrder(items).subscribe();

      const req = http.expectOne(`${base}/orders`);
      expect(req.request.body).toEqual({
        items, paymentMethod: undefined, delivery: undefined, couponCode: undefined,
      });
      req.flush(mockOrder);
    });

    it('propaga error si la creación falla', () => {
      let errorResult: unknown;
      service.createOrder([{ productId: 1, quantity: 1 }]).subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/orders`).flush({ message: 'Stock insuficiente' }, { status: 400, statusText: 'Bad Request' });

      expect((errorResult as { status: number }).status).toBe(400);
    });
  });

  describe('getMyOrders', () => {
    it('hace GET /orders/mine y retorna la lista', () => {
      let result: Order[] | undefined;
      service.getMyOrders().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/orders/mine`);
      expect(req.request.method).toBe('GET');
      req.flush([mockOrder]);

      expect(result?.length).toBe(1);
    });

    it('maneja una lista vacía', () => {
      let result: Order[] | undefined;
      service.getMyOrders().subscribe(r => (result = r));

      http.expectOne(`${base}/orders/mine`).flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getAllOrders', () => {
    it('hace GET /orders/all y retorna la lista', () => {
      let result: Order[] | undefined;
      service.getAllOrders().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/orders/all`);
      expect(req.request.method).toBe('GET');
      req.flush([mockOrder]);

      expect(result?.length).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('hace PATCH /orders/:id/status con el nuevo estado', () => {
      service.updateStatus(1, 'DELIVERED').subscribe();

      const req = http.expectOne(`${base}/orders/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'DELIVERED' });
      req.flush({ ...mockOrder, status: 'DELIVERED' });
    });
  });
});
