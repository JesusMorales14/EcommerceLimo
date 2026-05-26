import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminPage } from './admin';
import { environment } from '../../../environments/environment';

const makeOrder = (id: number) => ({
  id, status: 'PENDING', total: id * 100,
  createdAt: '2024-01-01T00:00:00Z',
  user: { id, name: `User ${id}`, email: `user${id}@test.com` },
});

const mockStats = {
  totalProducts: 50,
  lowStock:      3,
  totalOrders:   120,
  totalRevenue:  45000,
  recentOrders:  [1, 2, 3, 4].map(makeOrder),
};

describe('AdminPage', () => {
  let component: AdminPage;
  let fixture:   ComponentFixture<AdminPage>;
  let http:      HttpTestingController;

  const flushStats = (stats = mockStats) =>
    http.expectOne(r => r.url.includes('/products/stats')).flush(stats);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [AdminPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture   = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    flushStats();
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('carga las estadísticas y desactiva loading', () => {
      flushStats();
      expect(component.stats()).toEqual(mockStats);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(r => r.url.includes('/products/stats'))
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });

    it('sin pedidos recientes, totalPages es 0 y pagedOrders está vacío', () => {
      flushStats({ ...mockStats, recentOrders: [] });
      expect(component.totalPages()).toBe(0);
      expect(component.pagedOrders()).toEqual([]);
    });
  });

  // ── paginación ────────────────────────────────────────────────────────────────

  describe('paginación', () => {
    beforeEach(() => flushStats());

    it('pagedOrders retorna los primeros 3 pedidos en la página 1', () => {
      expect(component.pagedOrders().length).toBe(3);
      expect(component.pagedOrders()[0].id).toBe(1);
      expect(component.pagedOrders()[2].id).toBe(3);
    });

    it('goToPage cambia la página y actualiza pagedOrders', () => {
      component.goToPage(2);
      expect(component.currentPage()).toBe(2);
      expect(component.pagedOrders().length).toBe(1);
      expect(component.pagedOrders()[0].id).toBe(4);
    });

    it('totalPages calcula correctamente (4 pedidos, PAGE_SIZE=3 → 2 páginas)', () => {
      expect(component.totalPages()).toBe(2);
    });

    it('pages retorna el array de índices de páginas', () => {
      expect(component.pages()).toEqual([1, 2]);
    });
  });
});
