import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminDealsPage } from './admin-deals';
import { environment } from '../../../../environments/environment';

const mockSession = {
  id: 1, startsAt: '2024-01-01T10:00:00Z', endsAt: '2099-12-31T23:59:00Z',
  active: true, createdAt: '2024-01-01T00:00:00Z',
};

const mockProduct = {
  id: 1, name: 'Auriculares', description: 'desc', price: 50, stock: 3,
  brand: 'Sony', category: 'Electrónica', isOffer: true,
  images: [], colors: [], sizes: [],
};

describe('AdminDealsPage', () => {
  let component: AdminDealsPage;
  let fixture: ComponentFixture<AdminDealsPage>;
  let http: HttpTestingController;

  const flushLoad = (session = null as any, scheduled = null as any, items = [mockProduct]) => {
    http.expectOne(r => r.url.includes('/deal-sessions/active')).flush(session);
    http.expectOne(r => r.url.includes('/deal-sessions/scheduled')).flush(scheduled);
    http.expectOne(r => r.url.includes('/products')).flush({ items, total: items.length, page: 1, limit: 100, pages: 1 });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDealsPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDealsPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushLoad();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga la sesión activa y los productos de oferta', () => {
      flushLoad(mockSession, null, [mockProduct]);
      expect(component.session()).toEqual(mockSession);
      expect(component.offers().length).toBe(1);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque falle la sesión activa', () => {
      http.expectOne(r => r.url.includes('/deal-sessions/active'))
        .error(new ErrorEvent('Network error'));
      http.expectOne(r => r.url.includes('/deal-sessions/scheduled')).flush(null);
      http.expectOne(r => r.url.includes('/products')).flush({ items: [], total: 0, page: 1, limit: 100, pages: 0 });
      expect(component.loading()).toBe(false);
    });
  });

  describe('activate', () => {
    beforeEach(() => flushLoad());

    it('muestra error si no se selecciona fecha de fin', () => {
      component.endsAtInput = '';
      component.activate();
      expect(component.error()).toContain('fecha');
    });

    it('crea la sesión y recarga al activar correctamente', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      component.endsAtInput = future.toISOString().slice(0, 16);

      component.activate();

      const req = http.expectOne(`${environment.apiUrl}/deal-sessions`);
      expect(req.request.method).toBe('POST');
      req.flush(mockSession);

      flushLoad(mockSession);
      expect(component.saving()).toBe(false);
      expect(component.success()).toContain('activada');
    });
  });

  describe('paginación', () => {
    beforeEach(() => flushLoad(null, null, [mockProduct]));

    it('goToPage cambia la página', () => {
      component.goToPage(1);
      expect(component.currentPage()).toBe(1);
    });
  });
});
