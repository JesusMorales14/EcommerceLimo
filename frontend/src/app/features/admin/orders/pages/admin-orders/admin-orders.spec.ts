import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { AdminOrdersPage } from './admin-orders';

const base = environment.apiUrl;
const order = (id: number) => ({
  id, status: 'PENDING', total: 100, createdAt: '2026-01-01T00:00:00Z', userId: 1, user: { id: 1, name: 'Ana' },
  items: [{ id, quantity: 2, price: 50, product: { name: 'Polo' } }],
});

describe('AdminOrdersPage', () => {
  let fixture: ComponentFixture<AdminOrdersPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const render = async (orders: unknown[]) => {
    fixture = TestBed.createComponent(AdminOrdersPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne(`${base}/orders/all`).flush(orders);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminOrdersPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra el estado vacío', async () => {
    await render([]);
    expect(el.querySelector('.empty-orders')).toBeTruthy();
  });

  it('pagina los pedidos de 6 en 6', async () => {
    await render(Array.from({ length: 8 }, (_, i) => order(i + 1)));
    expect(el.querySelectorAll('app-admin-order-card')).toHaveLength(6);
  });

  it('actualiza el estado del pedido', async () => {
    await render([order(1)]);
    const select = el.querySelector<HTMLSelectElement>('#order-status-1')!;
    select.value = 'SHIPPING';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.querySelector('.updating-text')).toBeTruthy();

    const req = http.expectOne(`${base}/orders/1/status`);
    expect(req.request.body).toEqual({ status: 'SHIPPING' });
    req.flush({ ...order(1), status: 'SHIPPING' });
    fixture.detectChanges();
    expect(el.querySelector('.status-badge')!.textContent).toContain('En camino');
  });
});
