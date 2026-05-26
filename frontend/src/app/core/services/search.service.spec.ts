import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { SearchService } from './search.service';
import { environment } from '../../../environments/environment';
import { type Product } from '../models/product.model';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Smart TV LG 55"',
  brand: 'LG',
  price: 2500,
  stock: 3,
  images: ['tv.jpg'],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  description: 'Smart TV 4K',
  isOffer: false,
  ...overrides,
});

const flushSearch = (http: HttpTestingController, items: Product[]) => {
  const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
  req.flush({ items, total: items.length, page: 1, limit: 100, pages: 1 });
};

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(SearchService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── estado inicial ───────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('modal cerrado, sin resultados', () => {
      expect(service.isOpen()).toBe(false);
      expect(service.loading()).toBe(false);
      expect(service.brands()).toEqual([]);
      expect(service.products()).toEqual([]);
      expect(service.hasResults()).toBe(false);
    });
  });

  // ── open ─────────────────────────────────────────────────────────────────────

  describe('open', () => {
    it('abre el modal y activa loading', () => {
      service.open('LG');
      expect(service.isOpen()).toBe(true);
      expect(service.loading()).toBe(true);
      expect(service.query()).toBe('LG');
      vi.advanceTimersByTime(300);
      flushSearch(http, []);
    });

    it('clasifica productos por marca cuando el brand coincide con la query', () => {
      service.open('LG');
      vi.advanceTimersByTime(300);
      flushSearch(http, [
        mockProduct({ id: 1, brand: 'LG', name: 'Smart TV LG 55"' }),
        mockProduct({ id: 2, brand: 'LG', name: 'Monitor LG 27"' }),
      ]);

      expect(service.brands().length).toBe(1);
      expect(service.brands()[0].name).toBe('LG');
      expect(service.brands()[0].products.length).toBe(2);
      expect(service.products().length).toBe(0);
    });

    it('clasifica en productos por nombre cuando solo el nombre coincide', () => {
      service.open('Smart TV');
      vi.advanceTimersByTime(300);
      flushSearch(http, [
        mockProduct({ id: 1, brand: 'Samsung', name: 'Smart TV Samsung 50"' }),
      ]);

      expect(service.brands().length).toBe(0);
      expect(service.products().length).toBe(1);
    });

    it('no duplica producto que ya aparece en una marca', () => {
      service.open('LG');
      vi.advanceTimersByTime(300);
      flushSearch(http, [
        mockProduct({ id: 1, brand: 'LG', name: 'LG Smart TV' }),
      ]);

      expect(service.brands().length).toBe(1);
      expect(service.products().length).toBe(0);
    });

    it('desactiva loading y hasResults es true tras recibir resultados', () => {
      service.open('LG');
      vi.advanceTimersByTime(300);
      flushSearch(http, [mockProduct()]);

      expect(service.loading()).toBe(false);
      expect(service.hasResults()).toBe(true);
    });

    it('maneja error desactivando loading', () => {
      service.open('LG');
      vi.advanceTimersByTime(300);
      const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(service.loading()).toBe(false);
    });
  });

  // ── close ────────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('cierra el modal y limpia los resultados', () => {
      service.open('LG');
      vi.advanceTimersByTime(300);
      flushSearch(http, [mockProduct()]);

      service.close();

      expect(service.isOpen()).toBe(false);
      expect(service.brands()).toEqual([]);
      expect(service.products()).toEqual([]);
    });
  });
});
