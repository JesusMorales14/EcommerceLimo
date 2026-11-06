import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { AdminPage } from './admin';

const order = (id: number) => ({ id, total: 100, status: 'PENDING', createdAt: '2026-01-01', user: { name: 'Ana' } });

describe('AdminPage (dashboard)', () => {
  let http: HttpTestingController;

  const render = async (response: object | 'error') => {
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    TestBed.tick();
    const req = http.expectOne(`${environment.apiUrl}/admin/stats`);
    if (response === 'error') req.flush({}, { status: 500, statusText: 'Error' });
    else req.flush(response);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra métricas, pedidos recientes paginados y accesos', async () => {
    const el = await render({
      totalProducts: 10, lowStock: 2, totalOrders: 4, totalRevenue: 500,
      recentOrders: [1, 2, 3, 4].map(order),
    });
    expect(el.querySelectorAll('.stat-card')).toHaveLength(4);
    expect(el.querySelector('.stat-card.warning')).toBeTruthy();
    expect(el.querySelectorAll('.orders-mini-table tbody tr')).toHaveLength(3);
    expect(el.querySelectorAll('.admin-card')).toHaveLength(6);
  });

  it('mantiene los accesos aunque falle la carga de métricas', async () => {
    const el = await render('error');
    expect(el.querySelector('app-stats-grid')).toBeNull();
    expect(el.querySelectorAll('.admin-card')).toHaveLength(6);
  });
});
