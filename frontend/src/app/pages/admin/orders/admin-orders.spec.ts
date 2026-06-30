import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminOrdersPage } from './admin-orders';
import { environment } from '../../../../environments/environment';
import { Order } from '../../../core/models/order.model';

const mockOrder: Order = {
  id: 1, status: 'PENDING', total: 150,
  createdAt: '2024-01-01T00:00:00Z', userId: 1, items: [],
  user: { id: 1, name: 'Juan', email: 'juan@test.com' },
};

describe('AdminOrdersPage', () => {
  let component: AdminOrdersPage;
  let fixture: ComponentFixture<AdminOrdersPage>;
  let http: HttpTestingController;

  const flushOrders = (orders: Order[] = [mockOrder]) =>
    http.expectOne(`${environment.apiUrl}/orders/all`).flush(orders);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrdersPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrdersPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushOrders([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga todos los pedidos y desactiva loading', () => {
      flushOrders([mockOrder]);
      expect(component.orders()).toEqual([mockOrder]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(`${environment.apiUrl}/orders/all`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('paginación', () => {
    beforeEach(() => flushOrders([mockOrder]));

    it('goToPage cambia la página correctamente', () => {
      component.goToPage(1);
      expect(component.currentPage()).toBe(1);
    });

    it('goToPage no cambia la página si está fuera de rango', () => {
      component.goToPage(999);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => flushOrders([mockOrder]));

    it('actualiza el estado del pedido en la lista', () => {
      component.updateStatus(1, 'PROCESSING');

      const req = http.expectOne(`${environment.apiUrl}/orders/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'PROCESSING' });
      req.flush({ ...mockOrder, status: 'PROCESSING' });

      expect(component.orders()[0].status).toBe('PROCESSING');
      expect(component.updating()).toBeNull();
    });

    it('desactiva updating si falla la actualización', () => {
      component.updateStatus(1, 'DELIVERED');
      http.expectOne(`${environment.apiUrl}/orders/1/status`)
        .error(new ErrorEvent('Network error'));
      expect(component.updating()).toBeNull();
    });
  });
});
