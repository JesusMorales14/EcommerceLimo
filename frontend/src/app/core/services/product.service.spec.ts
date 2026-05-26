import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';
import { type Product } from '../models/product.model';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Monitor LG 27"',
  brand: 'LG',
  price: 1200,
  stock: 5,
  images: ['img1.jpg'],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  description: 'Monitor Full HD',
  isOffer: false,
  ...overrides,
});

const mockPage = (items: Product[]) => ({
  items,
  total: items.length,
  page: 1,
  limit: 40,
  pages: 1,
});

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── getAll ───────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('realiza GET /products con paginación por defecto', () => {
      service.getAll().subscribe();
      const req = http.expectOne(r => r.url === `${base}/products`);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('40');
      req.flush(mockPage([]));
    });

    it('envía parámetros de categoría y subcategoría', () => {
      service.getAll('tecnologia', 'monitores', 2, 20).subscribe();
      const req = http.expectOne(r => r.url === `${base}/products`);
      expect(req.request.params.get('category')).toBe('tecnologia');
      expect(req.request.params.get('subCategory')).toBe('monitores');
      expect(req.request.params.get('page')).toBe('2');
      req.flush(mockPage([]));
    });
  });

  // ── search ───────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('envía el parámetro search correctamente', () => {
      service.search('LG').subscribe();
      const req = http.expectOne(r => r.url === `${base}/products`);
      expect(req.request.params.get('search')).toBe('LG');
      req.flush(mockPage([mockProduct()]));
    });
  });

  // ── getById ──────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('realiza GET /products/:id y retorna el producto', () => {
      let result: Product | undefined;
      service.getById(1).subscribe(p => (result = p));
      http.expectOne(`${base}/products/1`).flush(mockProduct());
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Monitor LG 27"');
    });
  });

  // ── getFeatured ──────────────────────────────────────────────────────────────

  describe('getFeatured', () => {
    it('envía parámetro isFeatured=true', () => {
      service.getFeatured(4).subscribe();
      const req = http.expectOne(r => r.url === `${base}/products`);
      expect(req.request.params.get('isFeatured')).toBe('true');
      expect(req.request.params.get('limit')).toBe('4');
      req.flush(mockPage([]));
    });
  });

  // ── getOffers ────────────────────────────────────────────────────────────────

  describe('getOffers', () => {
    it('envía parámetro isOffer=true', () => {
      service.getOffers().subscribe();
      const req = http.expectOne(r => r.url === `${base}/products`);
      expect(req.request.params.get('isOffer')).toBe('true');
      req.flush(mockPage([]));
    });
  });

  // ── create / update / delete ─────────────────────────────────────────────────

  describe('CRUD admin', () => {
    it('create realiza POST /products', () => {
      service.create({ name: 'Nuevo', price: 100 }).subscribe();
      const req = http.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');
      req.flush(mockProduct({ name: 'Nuevo' }));
    });

    it('update realiza PATCH /products/:id', () => {
      service.update(1, { price: 999 }).subscribe();
      const req = http.expectOne(`${base}/products/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockProduct({ price: 999 }));
    });

    it('delete realiza DELETE /products/:id', () => {
      service.delete(1).subscribe();
      const req = http.expectOne(`${base}/products/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
